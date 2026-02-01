import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Card, Typography, Alert, Input, Space, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { verifyOtpForReset, sendOtpForReset } from '../services/resetService';

const { Title, Text } = Typography;

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  // Redirect if no username
  useEffect(() => {
    if (!username) {
      navigate('/forgot-password');
    }
  }, [username, navigate]);

  // Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (countdown > 0 && !canResend) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown, canResend]);

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

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (otp.some((digit) => digit === '')) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setLoading(true);

    try {
      const otpCode = otp.join('');
      const result = await verifyOtpForReset(username, otpCode);

      if (result.success && result.data?.token) {
        message.success('OTP verified successfully!');
        navigate('/reset-password', {
          state: {
            username,
            token: result.data.token,
          },
        });
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setError('');

    try {
      const result = await sendOtpForReset(username);

      if (result.success) {
        message.success('Verification code resent to your phone!');
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
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
              Enter Verification Code
            </Title>
            <Text type="secondary">
              We've sent a 4-digit code to {username}
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

          <div style={{ marginBottom: '32px' }}>
            <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
              {otp.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={inputRefs[idx]}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  maxLength={1}
                  disabled={loading}
                  style={{
                    width: 60,
                    height: 60,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                />
              ))}
            </Space>
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            disabled={otp.some((digit) => digit === '')}
            onClick={handleSubmit}
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '16px' }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div style={{ textAlign: 'center' }}>
            {!canResend ? (
              <Text type="secondary">
                Resend code in <Text strong>{countdown}s</Text>
              </Text>
            ) : (
              <Button
                type="link"
                onClick={handleResend}
                loading={resendLoading}
                style={{ padding: 0 }}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/forgot-password"
              style={{ color: '#8c8c8c', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            >
              <ArrowLeftOutlined /> Change Phone Number
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

export default VerifyOtp;
