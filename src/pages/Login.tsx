import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Layout, message } from 'antd';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import '../assets/styles/Auth.css';

const { Title, Text } = Typography;
const { Header, Footer, Content } = Layout;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setSubscription, checkAuthentication } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      // Add +255 prefix to phone number
      const phoneNumber = '+255' + values.phoneNumber;

      const result = await login(phoneNumber, values.password);

      if (result.success) {
        message.success('Login successful!');
        setIsAuthenticated(true);
        
        if (result.subscription) {
          setSubscription(result.subscription);
        }
        
        await checkAuthentication();
        navigate('/dashboard');
      } else {
        message.error(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      message.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="auth-layout">
      <Header className="auth-header">
        <div className="container">
          <div className="text-brand">Tanaka</div>
        </div>
      </Header>
      <Content className="auth-content">
        <div className="container auth-container-centered">
          <Card className="auth-card-main" bordered={false}>
            <div className="auth-card-body">
              <div className="auth-logo-section">
                <img src="/Logo.png" alt="Tanaka" width="64" height="64" className="mb-3" />
                <Title level={4} className="auth-title">Rent & Manage with Ease</Title>
                <Text type="secondary" className="auth-subtitle">
                  Please log in to your account
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
                    { required: true, message: 'Please input your phone number!' },
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

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                    className="auth-input"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    visibilityToggle
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
                    {loading ? 'Logging in...' : 'Log in'}
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div className="auth-card-footer">
              <div className="auth-footer-link">
                Don't have an account?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  className="auth-link"
                >
                  Sign up
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
                  Forgot password?
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
                  Privacy Policy
                </a>
              </div>
            </div>
          </Card>
        </div>
      </Content>
      <Footer className="auth-footer-bottom">
        <Text className="auth-footer-text">
          © {new Date().getFullYear()} Tanaka. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
};

export default Login;
