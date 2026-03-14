import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { sendOtpForReset } from '../services/resetService';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        message.success(t('auth:forgotPassword.codeSentSuccess'));
        navigate('/verify-otp', { state: { username: phoneNumber } });
      } else {
        setError(result.error || t('auth:forgotPassword.codeSentFailed'));
      }
    } catch (err) {
      setError(t('auth:forgotPassword.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ padding: '20px 0', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '24px', color: '#CC5B4B' }}>{t('auth:brand')}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSwitcher />
            <Link to="/login" style={{ color: '#CC5B4B', fontWeight: 500 }}>
              {t('auth:register.logIn')}
            </Link>
          </div>
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
              {t('auth:forgotPassword.title')}
            </Title>
            <Text type="secondary">
              {t('auth:forgotPassword.subtitle')}
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
              label={t('auth:forgotPassword.phoneLabel')}
              name="phoneNumber"
              rules={[
                { required: true, message: t('auth:forgotPassword.phoneRequired') },
                {
                  pattern: /^[0-9]{9}$/,
                  message: t('auth:forgotPassword.phoneInvalid'),
                },
              ]}
              help={t('auth:forgotPassword.phoneHelp')}
            >
              <Input
                prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                placeholder={t('auth:forgotPassword.phonePlaceholder')}
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
                {loading ? t('auth:forgotPassword.sending') : t('auth:forgotPassword.sendCodeButton')}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ArrowLeftOutlined /> {t('auth:forgotPassword.backToLogin')}
            </Link>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {t('auth:copyright', { year: new Date().getFullYear() })}
        </Text>
      </footer>
    </div>
  );
};

export default ForgotPassword;
