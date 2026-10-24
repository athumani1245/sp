import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Row, Col, Space } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  FacebookOutlined,
} from '@ant-design/icons';

const { Header, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

// Section anchors live on the landing page; prefix with "/" when rendered elsewhere
const useAnchorBase = () => (useLocation().pathname === '/' ? '' : '/');

export const SiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const base = useAnchorBase();

  return (
    <Header className="landing-header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/')}>
            <img src="/Logo.png" alt="Tanaka" width="40" height="40" />
            <span className="brand-name">Tanaka</span>
          </div>
          <nav className="nav-links">
            <a href={`${base}#features`}>Features</a>
            <a href={`${base}#about`}>About</a>
            <a href="/academy">Academy</a>
            <a href={`${base}#testimonials`}>Testimonials</a>
            <a href={`${base}#contact`}>Contact</a>
          </nav>
          <Space>
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export const SiteFooter: React.FC = () => {
  const base = useAnchorBase();

  return (
    <Footer className="landing-footer" id="contact">
      <div className="container">
        <Row gutter={[24, 48]}>
          <Col xs={24} md={8}>
            <div className="footer-brand">
              <img src="/Logo.png" alt="Tanaka" width="40" height="40" />
              <span className="brand-name">Tanaka</span>
            </div>
            <Paragraph style={{ color: 'white' }}>Streamlining property management across Tanzania.</Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Contact</Title>
            <Space vertical>
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                <a href="mailto:info@tanaka.co.tz">info@tanaka.co.tz</a>
              </div>
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                <a href="tel:+255736450475">+255 736 450 475</a>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Quick Links</Title>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Space vertical>
                  <a href={`${base}#features`}>Features</a>
                  <a href="/academy">Academy</a>
                </Space>
              </Col>
              <Col span={12}>
                <Space vertical>
                  <a href="/privacy-policy">Privacy</a>
                  <a href="#contact">Support</a>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
        <div className="footer-bottom">
          <Text style={{ color: 'white' }}>© {new Date().getFullYear()} Tanaka. All rights reserved.</Text>
          <Space size="large" className="footer-social">
            <a href="https://www.linkedin.com/company/tanakas" target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined style={{ fontSize: 20 }} />
            </a>
            <a href="https://www.instagram.com/tanakatanzania" target="_blank" rel="noopener noreferrer">
              <InstagramOutlined style={{ fontSize: 20 }} />
            </a>
            <a href="https://www.facebook.com/tanakatanzania" target="_blank" rel="noopener noreferrer">
              <FacebookOutlined style={{ fontSize: 20 }} />
            </a>
          </Space>
        </div>
      </div>
    </Footer>
  );
};
