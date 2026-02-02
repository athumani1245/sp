import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Modal,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
} from 'antd';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useSendOtpForPhoneChange,
  useVerifyOtpAndChangePhone,
  useResendOtpForPhoneChange,
} from '../hooks/useProfile';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LockOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  KeyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender?: string;
  date_of_birth?: string;
}

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data: profileData, isLoading: loading, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const sendOtpMutation = useSendOtpForPhoneChange();
  const verifyOtpMutation = useVerifyOtpAndChangePhone();
  const resendOtpMutation = useResendOtpForPhoneChange();

  const [isEditing, setIsEditing] = useState(false);

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Change phone modal
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp' | 'success'>('input');
  const [phoneOtp, setPhoneOtp] = useState<string[]>(['', '', '', '']);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [cachedPhoneNumber, setCachedPhoneNumber] = useState<string>('');
  const otpInputRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  const loadUserProfile = useCallback(async () => {
    if (profileData) {
      form.setFieldsValue({
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        phone: profileData.username,
        address: profileData.address,
        gender: profileData.gender,
        date_of_birth: profileData.date_of_birth,
      });
    }
  }, [profileData, form]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [navigate, loadUserProfile]);

  // OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (phoneStep === 'otp' && countdown > 0 && !canResendOtp) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phoneStep, countdown, canResendOtp]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      await updateProfileMutation.mutateAsync({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        address: values.address,
      });

      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      form.setFieldsValue({
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        phone: profileData.username,
        address: profileData.address,
        gender: profileData.gender,
        date_of_birth: profileData.date_of_birth,
      });
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      await changePasswordMutation.mutateAsync({
        old_password: values.currentPassword,
        new_password: values.newPassword,
      });

      setShowPasswordModal(false);
      passwordForm.resetFields();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSendOtp = async () => {
    try {
      const values = await phoneForm.validateFields(['newPhone']);
      
      const phoneWithCountryCode = `+255${values.newPhone}`;
      setCachedPhoneNumber(phoneWithCountryCode);
      await sendOtpMutation.mutateAsync(phoneWithCountryCode);

      setPhoneStep('otp');
      setCountdown(60);
      setCanResendOtp(false);
      setTimeout(() => otpInputRefs[0].current?.focus(), 100);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);

    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !phoneOtp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = phoneOtp.join('');
    if (otpCode.length !== 4) {
      message.error('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({
        username: cachedPhoneNumber,
        otp_code: otpCode,
      });

      setPhoneStep('success');
      await refetch();
      setTimeout(() => {
        setShowPhoneModal(false);
        setPhoneStep('input');
        setPhoneOtp(['', '', '', '']);
        phoneForm.resetFields();
      }, 2000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendOtp = async () => {
    setPhoneOtp(['', '', '', '']);
    setCanResendOtp(false);
    setCountdown(60);

    try {
      const values = await phoneForm.getFieldsValue();
      const phoneWithCountryCode = `+255${values.newPhone}`;
      setCachedPhoneNumber(phoneWithCountryCode);
      await resendOtpMutation.mutateAsync(phoneWithCountryCode);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          My Profile
        </Title>
        <Text type="secondary">Manage your personal information and account settings</Text>
      </div>

      <Spin spinning={loading}>
        {/* Personal Information Card */}
        <Card
          title="Personal Information"
          extra={
            !isEditing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Space>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSave}
                  loading={updateProfileMutation.isPending}
                >
                  Save
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            )
          }
          style={{ marginBottom: 24 }}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="First Name"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Last Name"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Phone Number" name="phone">
                  <Input prefix={<PhoneOutlined />} placeholder="Phone" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please enter your address' }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Street address"
                disabled={!isEditing}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Gender" name="gender">
                  <Input placeholder="Gender" disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date of Birth" name="date_of_birth">
                  <Input placeholder="Date of Birth" disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Account Settings Card */}
        <Card title="Account Settings">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                icon={<KeyOutlined />}
                block
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                icon={<PhoneOutlined />}
                block
                onClick={() => setShowPhoneModal(true)}
              >
                Change Phone Number
              </Button>
            </Col>
          </Row>
        </Card>
      </Spin>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>Change Password</span>
          </Space>
        }
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowPasswordModal(false);
              passwordForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={changePasswordMutation.isPending}
            onClick={handlePasswordSubmit}
          >
            Change Password
          </Button>,
        ]}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Phone Number Modal */}
      <Modal
        title={
          <Space>
            <PhoneOutlined />
            <span>Change Phone Number</span>
          </Space>
        }
        open={showPhoneModal}
        onCancel={() => {
          setShowPhoneModal(false);
          setPhoneStep('input');
          setPhoneOtp(['', '', '', '']);
          phoneForm.resetFields();
        }}
        footer={null}
      >
        {phoneStep === 'input' && (
          <Form form={phoneForm} layout="vertical">
            <Form.Item
              label="New Phone Number"
              name="newPhone"
              rules={[
                { required: true, message: 'Please enter your new phone number' },
                {
                  pattern: /^[0-9]{9}$/,
                  message: 'Phone number must be exactly 9 digits',
                },
              ]}
            >
              <Input
                prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                placeholder="Enter 9 digit phone number"
                maxLength={9}
                size="large"
              />
            </Form.Item>
            <Button
              type="primary"
              block
              loading={sendOtpMutation.isPending}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </Form>
        )}

        {phoneStep === 'otp' && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Enter the 4-digit code sent to your phone number
            </Text>

            <Space size="large" style={{ marginBottom: 24, justifyContent: 'center', width: '100%' }}>
              {phoneOtp.map((digit, index) => (
                <Input
                  key={index}
                  ref={otpInputRefs[index]}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  maxLength={1}
                  style={{
                    width: 50,
                    height: 50,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </Space>

            <Space vertical style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                loading={verifyOtpMutation.isPending}
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </Button>

              <Button
                block
                disabled={!canResendOtp}
                loading={resendOtpMutation.isPending}
                onClick={handleResendOtp}
              >
                {canResendOtp ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
              </Button>
            </Space>
          </div>
        )}

        {phoneStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ fontSize: 48, color: '#52c41a' }}>✓</Text>
            <Title level={4} style={{ marginTop: 16 }}>
              Phone Number Updated!
            </Title>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
