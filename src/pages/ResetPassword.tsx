import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Modal, message } from 'antd';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { resetPassword } from '../services/resetService';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, token } = location.state || {};

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Redirect if no username or token
  useEffect(() => {
    if (!username || !token) {
      navigate('/forgot-password');
    }
  }, [username, token, navigate]);

  // Countdown timer for redirect
  useEffect(() => {
    let interval: any = null;
    if (showSuccessModal && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (redirectCountdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(interval);
  }, [showSuccessModal, redirectCountdown, navigate]);

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      const result = await resetPassword(token, values.newPassword);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ padding: '20px 0', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '24px', color: '#CC5B4B' }}>Tanaka</Text>
          <Link to="/login" style={{ color: '#CC5B4B', fontWeight: 500 }}>
            Log In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <Card style={{ maxWidth: '420px', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img
              src="/Logo.png"
              alt="Tanaka Logo"
              style={{ width: '64px', height: '64px', marginBottom: '16px' }}
            />
            <Title level={3} style={{ marginBottom: '8px', fontWeight: 'normal' }}>
              Reset Your Password
            </Title>
            <Text type="secondary">
              Enter your new password below
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: '24px' }}
            />
          )}

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
                size="large"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your password' },
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
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
                size="large"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          © {new Date().getFullYear()} Tanaka. All rights reserved.
        </Text>
      </footer>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
          <Title level={4}>Password Reset Successful!</Title>
          <Text type="secondary">
            Your password has been reset successfully.
            <br />
            Redirecting to login in {redirectCountdown} seconds...
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default ResetPassword;
