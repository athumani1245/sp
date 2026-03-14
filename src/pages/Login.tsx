import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Layout, message } from 'antd';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../assets/styles/Auth.css';

const { Title, Text } = Typography;
const { Header, Footer, Content } = Layout;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setIsAuthenticated, setSubscription, checkAuthentication } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      // Normalize phone number to +255 format
      let phoneNumber = values.phoneNumber.trim();
      
      // If starts with 0, replace with +255
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+255' + phoneNumber.substring(1);
      }
      // If starts with +255, use as is
      else if (phoneNumber.startsWith('+255')) {
        phoneNumber = phoneNumber;
      }
      // If just 9 digits, add +255
      else if (/^\d{9}$/.test(phoneNumber)) {
        phoneNumber = '+255' + phoneNumber;
      }

      const result = await login(phoneNumber, values.password);

      if (result.success) {
        message.success(t('auth:login.loginSuccess'));
        setIsAuthenticated(true);
        
        if (result.subscription) {
          setSubscription(result.subscription);
        }
        
        await checkAuthentication();
        navigate('/dashboard');
      } else {
        message.error(result.error || t('auth:login.loginFailed'));
      }
    } catch (error) {
      message.error(t('auth:login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="auth-layout">
      <Header className="auth-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-brand">{t('auth:brand')}</div>
          <LanguageSwitcher />
        </div>
      </Header>
      <Content className="auth-content">
        <div className="container auth-container-centered">
          <Card className="auth-card-main" bordered={false}>
            <div className="auth-card-body">
              <div className="auth-logo-section">
                <img src="/Logo.png" alt="Tanaka" width="64" height="64" className="mb-3" />
                <Title level={4} className="auth-title">{t('auth:login.title')}</Title>
                <Text type="secondary" className="auth-subtitle">
                  {t('auth:login.subtitle')}
                </Text>
              </div>
              <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                className="auth-form"
                requiredMark={false}
              >
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    { required: true, message: t('auth:login.phoneRequired') },
                    {
                      pattern: /^(\+255\d{9}|0\d{9}|\d{9})$/,
                      message: t('auth:login.phoneInvalid'),
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={t('auth:login.phonePlaceholder')}
                    size="large"
                    autoComplete="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: t('auth:login.passwordRequired') }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={t('auth:login.passwordPlaceholder')}
                    size="large"
                    className="auth-input"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    visibilityToggle
                    autoComplete="current-password"
                    id="password"
                    name="password"
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
                  >
                    {loading ? t('auth:login.loggingIn') : t('auth:login.loginButton')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div className="auth-card-footer">
              <div className="auth-footer-link">
                {t('auth:login.noAccount')}{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  className="auth-link"
                >
                  {t('auth:login.signUp')}
                </a>
              </div>
              <div className="auth-footer-link">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                  className="auth-link"
                >
                  {t('auth:login.forgotPassword')}
                </a>
              </div>
              <div className="auth-footer-link">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                  className="auth-link"
                >
                  {t('auth:login.privacyPolicy')}
                </a>
              </div>
            </div>
          </Card>
        </div>
      </Content>
      <Footer className="auth-footer-bottom">
        <Text className="auth-footer-text">
          {t('auth:copyright', { year: new Date().getFullYear() })}
        </Text>
      </Footer>
    </Layout>
  );
};

export default Login;
