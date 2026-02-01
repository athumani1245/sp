import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Layout,
  Steps,
  Modal,
  Alert,
  Row,
  Col,
  Space,
  Spin,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { sendRegistrationOtp, verifyRegistrationOtp, registerUser } from '../services/registrationService';
import '../assets/styles/Auth.css';

const { Title, Text, Paragraph } = Typography;
const { Header, Footer, Content } = Layout;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [phoneForm] = Form.useForm();

  // Registration stages: 'phone' -> 'otp' -> 'form' -> 'success'
  const [stage, setStage] = useState<'phone' | 'otp' | 'form' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (countdown > 0 && !canResend && showOtpModal) {
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown, canResend, showOtpModal]);

  // Auto-focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal && inputRefs[0].current) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  const handleOtpChange = (value: string, idx: number) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[idx] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handlePhoneSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      // Format phone number with +255 prefix
      const fullPhoneNumber = '+255' + values.phoneNumber;

      const result = await sendRegistrationOtp(fullPhoneNumber);
      
      if (result.success) {
        setPhoneNumber(fullPhoneNumber);
        setStage('otp');
        setShowOtpModal(true);
        setCountdown(60);
        setCanResend(false);
        setError('');
        message.success('Verification code sent to your phone');
      } else {
        setError(result.error || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setOtpError('Please enter all 4 digits');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyRegistrationOtp(phoneNumber, otpCode);
      
      if (result.success) {
        // Store the token from OTP verification
        if (result.data?.token) {
          setOtpToken(result.data.token);
        }
        setStage('form');
        setShowOtpModal(false);
        setOtpError('');
        message.success('Phone number verified successfully');
      } else {
        setOtpError(result.error || 'Invalid verification code');
        // Clear OTP inputs on error
        setOtp(['', '', '', '']);
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }
    } catch (error) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleRegistrationSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      // Complete registration after OTP verification
      const data = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        username: phoneNumber,
        password: values.password,
        token: otpToken,
      };

      const registerResult = await registerUser(data);

      if (registerResult.statusCode === 200 || registerResult.success) {
        setStage('success');
        message.success('Registration successful! Redirecting to login...');

        // Redirect to login after showing success
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setError(registerResult.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setOtpError('');

    try {
      const result = await sendRegistrationOtp(phoneNumber);
      
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
        message.success('Verification code resent');
      } else {
        setOtpError(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp(['', '', '', '']);
    setOtpError('');
    setStage('phone');
  };

  const getCurrentStep = () => {
    switch (stage) {
      case 'phone':
        return 0;
      case 'otp':
        return 1;
      case 'form':
      case 'success':
        return 2;
      default:
        return 0;
    }
  };

  return (
    <Layout className="auth-layout">
      <Header className="auth-header">
        <div className="container">
          <div className="auth-header-content">
            <div className="text-brand">Tanaka</div>
            <Space>
              <Text>Already have an account?</Text>
              <Button type="link" onClick={() => navigate('/login')} className="auth-link-btn">
                Log In
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      <Content className="auth-content">
        <div className="container auth-container-centered" style={{ maxWidth: 520 }}>
          <Card className="auth-card-main" bordered={false}>
            <div className="auth-card-body">
              <div className="auth-logo-section">
                <img src="/Logo.png" alt="Tanaka" width="64" height="64" className="mb-3" />

                {/* Stage Indicator */}
                {stage !== 'success' && (
                  <div className="registration-stages-wrapper">
                    <Steps
                      current={getCurrentStep()}
                      size="small"
                      className="registration-steps"
                      items={[
                        { title: 'Phone Number' },
                        { title: 'Verify OTP' },
                        { title: 'Complete Info' },
                      ]}
                    />
                  </div>
                )}

                <Title level={4} className="auth-title">
                  {stage === 'phone' && 'Enter Your Phone Number'}
                  {stage === 'otp' && 'Verify Your Phone Number'}
                  {stage === 'form' && 'Complete Your Registration'}
                  {stage === 'success' && 'Registration Successful!'}
                </Title>
                <Text type="secondary" className="auth-subtitle">
                  {stage === 'phone' && "We'll send you a verification code"}
                  {stage === 'otp' && 'Enter the code sent to your phone'}
                  {stage === 'form' && 'Fill in your details to complete registration'}
                  {stage === 'success' && 'Your account has been created successfully'}
                </Text>
              </div>

              {error && (stage === 'phone' || stage === 'form') && (
                <Alert message={error} type="error" showIcon closable className="mb-3" />
              )}

              {/* Success Stage */}
              {stage === 'success' && (
                <div className="text-center py-4">
                  <CheckCircleOutlined
                    style={{ fontSize: '4rem', color: '#52c41a', marginBottom: '1.5rem' }}
                  />
                  <Title level={5}>Welcome to Tanaka!</Title>
                  <Paragraph type="secondary">
                    Your account has been successfully created.
                    <br />
                    Redirecting you to login...
                  </Paragraph>
                  <Spin size="large" />
                </div>
              )}

              {/* Phone Number Entry Form */}
              {stage === 'phone' && (
                <Form
                  form={phoneForm}
                  onFinish={handlePhoneSubmit}
                  layout="vertical"
                  className="auth-form"
                  requiredMark={false}
                >
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                      { required: true, message: 'Please input your phone number!' },
                      { pattern: /^[0-9]{9}$/, message: 'Please enter a valid 9-digit phone number' }
                    ]}
                  >
                    <Input
                      prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                      placeholder="Enter 9 digit phone number"
                      maxLength={9}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="auth-submit-btn"
                      icon={!loading && <ArrowRightOutlined />}
                      iconPosition="end"
                    >
                      {loading ? 'Sending Code...' : 'Continue'}
                    </Button>
                  </Form.Item>
                </Form>
              )}

              {/* Registration Form */}
              {stage === 'form' && (
                <>
                  <Alert
                    message={
                      <span>
                        Phone number verified: <strong>{phoneNumber}</strong>
                      </span>
                    }
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    className="mb-3"
                  />
                  <Form
                    form={form}
                    onFinish={handleRegistrationSubmit}
                    layout="vertical"
                    className="auth-form"
                    requiredMark={false}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="First Name"
                          name="firstName"
                          rules={[{ required: true, message: 'Please input your first name!' }]}
                        >
                          <Input size="large" className="auth-input" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Last Name"
                          name="lastName"
                          rules={[{ required: true, message: 'Please input your last name!' }]}
                        >
                          <Input size="large" className="auth-input" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        size="large"
                        className="auth-input"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            size="large"
                            className="auth-input"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Confirm Password"
                          name="confirmPassword"
                          dependencies={['password']}
                          rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            size="large"
                            className="auth-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        className="auth-submit-btn"
                        icon={!loading && <CheckCircleOutlined />}
                        iconPosition="end"
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              )}
            </div>

            {stage !== 'success' && (
              <div className="auth-card-footer">
                <div className="auth-footer-link">
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                    className="auth-link"
                  >
                    Log In
                  </a>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Content>

      {/* OTP Verification Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#CC5B4B' }} />
            <span>Verify Your Phone</span>
          </Space>
        }
        open={showOtpModal}
        onCancel={handleCloseOtpModal}
        footer={null}
        closable={!loading}
        maskClosable={false}
        centered
      >
        <div className="text-center mb-4">
          <Paragraph type="secondary" className="mb-0">
            We've sent a verification code to
          </Paragraph>
          <Paragraph strong className="mb-0">
            {phoneNumber}
          </Paragraph>
          <Text type="secondary">Enter the 4-digit code below</Text>
        </div>

        {otpError && (
          <Alert message={otpError} type="error" showIcon closable className="mb-3" />
        )}

        <form onSubmit={handleOtpVerify}>
          <div className="otp-input-container">
            <Space size="middle">
              {[0, 1, 2, 3].map((idx) => (
                <Input
                  key={idx}
                  ref={inputRefs[idx]}
                  className="otp-input"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  disabled={loading}
                  size="large"
                  style={{
                    width: 50,
                    height: 50,
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </Space>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            disabled={otp.some((digit) => digit === '')}
            className="auth-submit-btn"
            style={{ marginTop: 24, marginBottom: 16 }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <div className="text-center">
            {!canResend ? (
              <Text type="secondary">
                Resend code in <Text strong>{countdown}s</Text>
              </Text>
            ) : (
              <Button
                type="link"
                onClick={handleResendOtp}
                loading={resendLoading}
                className="auth-link-btn"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            )}
          </div>
        </form>
      </Modal>

      <Footer className="auth-footer-bottom">
        <Text className="auth-footer-text">
          © {new Date().getFullYear()} Tanaka. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
};

export default Register;
