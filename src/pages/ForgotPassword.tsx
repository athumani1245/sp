import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { sendOtpForReset } from '../services/resetService';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      // Format phone number with +255 prefix
      const phoneNumber = '+255' + values.phoneNumber;

      const result = await sendOtpForReset(phoneNumber);

      if (result.success) {
        message.success('Verification code sent to your phone!');
        navigate('/verify-otp', { state: { username: phoneNumber } });
      } else {
        setError(result.error || 'Failed to send OTP');
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
              Forgot Password?
            </Title>
            <Text type="secondary">
              Don't worry, we'll send you a verification code to reset it
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
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                {
                  pattern: /^[0-9]{9}$/,
                  message: 'Phone number must be exactly 9 digits',
                },
              ]}
              help="We'll send a verification code to this number"
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
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ArrowLeftOutlined /> Back to Login
            </Link>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          © {new Date().getFullYear()} Tanaka. All rights reserved.
        </Text>
      </footer>
    </div>
  );
};

export default ForgotPassword;
