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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      message.error(t('profile:changePhoneModal.otpIncomplete'));
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
          {t('profile:title')}
        </Title>
        <Text type="secondary">{t('profile:subtitle')}</Text>
      </div>

      <Spin spinning={loading}>
        {/* Personal Information Card */}
        <Card
          title={t('profile:personalInfo.title')}
          extra={
            !isEditing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                {t('profile:personalInfo.editProfile')}
              </Button>
            ) : (
              <Space>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSave}
                  loading={updateProfileMutation.isPending}
                >
                  {t('profile:personalInfo.save')}
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  {t('profile:personalInfo.cancel')}
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
                  label={t('profile:personalInfo.firstName')}
                  name="firstName"
                  rules={[{ required: true, message: t('profile:personalInfo.firstNameRequired') }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t('profile:personalInfo.firstNamePlaceholder')}
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('profile:personalInfo.lastName')}
                  name="lastName"
                  rules={[{ required: true, message: t('profile:personalInfo.lastNameRequired') }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t('profile:personalInfo.lastNamePlaceholder')}
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={t('profile:personalInfo.email')}
                  name="email"
                  rules={[
                    { required: true, message: t('profile:personalInfo.emailRequired') },
                    { type: 'email', message: t('profile:personalInfo.emailInvalid') },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder={t('profile:personalInfo.emailPlaceholder')}
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={t('profile:personalInfo.phone')} name="phone">
                  <Input prefix={<PhoneOutlined />} placeholder={t('profile:personalInfo.phonePlaceholder')} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={t('profile:personalInfo.address')}
              name="address"
              rules={[{ required: true, message: t('profile:personalInfo.addressRequired') }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder={t('profile:personalInfo.addressPlaceholder')}
                disabled={!isEditing}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label={t('profile:personalInfo.gender')} name="gender">
                  <Input placeholder={t('profile:personalInfo.genderPlaceholder')} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={t('profile:personalInfo.dateOfBirth')} name="date_of_birth">
                  <Input placeholder={t('profile:personalInfo.dateOfBirthPlaceholder')} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Account Settings Card */}
        <Card title={t('profile:accountSettings.title')}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                icon={<KeyOutlined />}
                block
                onClick={() => setShowPasswordModal(true)}
              >
                {t('profile:accountSettings.changePassword')}
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                icon={<PhoneOutlined />}
                block
                onClick={() => setShowPhoneModal(true)}
              >
                {t('profile:accountSettings.changePhone')}
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
            <span>{t('profile:changePasswordModal.title')}</span>
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
            {t('profile:changePasswordModal.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={changePasswordMutation.isPending}
            onClick={handlePasswordSubmit}
          >
            {t('profile:changePasswordModal.submit')}
          </Button>,
        ]}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label={t('profile:changePasswordModal.currentPassword')}
            name="currentPassword"
            rules={[{ required: true, message: t('profile:changePasswordModal.currentPasswordRequired') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('profile:changePasswordModal.currentPasswordPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('profile:changePasswordModal.newPassword')}
            name="newPassword"
            rules={[
              { required: true, message: t('profile:changePasswordModal.newPasswordRequired') },
              { min: 8, message: t('profile:changePasswordModal.newPasswordMinLength') },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('profile:changePasswordModal.newPasswordPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('profile:changePasswordModal.confirmPassword')}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('profile:changePasswordModal.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('profile:changePasswordModal.passwordsDoNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('profile:changePasswordModal.confirmPasswordPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Phone Number Modal */}
      <Modal
        title={
          <Space>
            <PhoneOutlined />
            <span>{t('profile:changePhoneModal.title')}</span>
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
              label={t('profile:changePhoneModal.newPhone')}
              name="newPhone"
              rules={[
                { required: true, message: t('profile:changePhoneModal.newPhoneRequired') },
                {
                  pattern: /^[0-9]{9}$/,
                  message: t('profile:changePhoneModal.newPhonePattern'),
                },
              ]}
            >
              <Input
                prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                placeholder={t('profile:changePhoneModal.newPhonePlaceholder')}
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
              {t('profile:changePhoneModal.sendOtp')}
            </Button>
          </Form>
        )}

        {phoneStep === 'otp' && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              {t('profile:changePhoneModal.otpInstructions')}
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
                {t('profile:changePhoneModal.verifyOtp')}
              </Button>

              <Button
                block
                disabled={!canResendOtp}
                loading={resendOtpMutation.isPending}
                onClick={handleResendOtp}
              >
                {canResendOtp ? t('profile:changePhoneModal.resendOtp') : t('profile:changePhoneModal.resendOtpIn', { count: countdown })}
              </Button>
            </Space>
          </div>
        )}

        {phoneStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ fontSize: 48, color: '#52c41a' }}>✓</Text>
            <Title level={4} style={{ marginTop: 16 }}>
              {t('profile:changePhoneModal.successTitle')}
            </Title>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
