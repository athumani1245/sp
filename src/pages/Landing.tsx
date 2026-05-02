import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Statistic,
  Badge,
} from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ToolOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  StarFilled,
  SafetyOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  FacebookOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import '../assets/styles/Landing.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <HomeOutlined />,
      title: 'Property Management',
      description: 'Manage multiple properties with ease. Track units, tenants, and maintenance all in one place.',
    },
    {
      icon: <TeamOutlined />,
      title: 'Tenant Management',
      description: 'Keep detailed tenant records, track lease agreements, and manage communications effortlessly.',
    },
    {
      icon: <CalendarOutlined />,
      title: 'Lease Tracking',
      description: 'Monitor lease terms, renewal dates, and rental agreements with automated reminders.',
    },
    {
      icon: <CreditCardOutlined />,
      title: 'Payment Tracking',
      description: 'Track rent payments, late fees, and generate financial reports with our integrated system.',
    },
    {
      icon: <ToolOutlined />,
      title: 'Maintenance Requests',
      description: 'Handle maintenance requests efficiently with our ticketing system and vendor management.',
    },
    {
      icon: <LineChartOutlined />,
      title: 'Analytics & Reports',
      description: 'Get insights into your property performance with detailed analytics and custom reports.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Property Owner',
      text: "Tanaka has revolutionized how I manage my rental properties. Everything is so much easier now!",
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Real Estate Investor',
      text: "The best property management platform I've used. Saves me hours every week.",
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Property Manager',
      text: 'Outstanding features and excellent customer support. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <Layout className="landing-page">
      {/* Navigation */}
      <Header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section" onClick={() => navigate('/')}>
              <img src="/Logo.png" alt="Tanaka" width="40" height="40" />
              <span className="brand-name">Tanaka</span>
            </div>
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#contact">Contact</a>
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

      <Content>
        {/* Hero Section */}
        <section className="hero-section" id="home">
          <div className="container">
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} lg={12}>
                <div className="hero-content">
                  <Title level={1} className="hero-title">
                    Rent & Manage with <span className="text-primary">Ease</span>
                  </Title>
                  <Paragraph className="hero-description">
                    Streamline your property management with Tanaka's comprehensive platform. From tenant screening to rent collection, we've got you covered.
                  </Paragraph>
                  <Space size="large" className="hero-buttons">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate('/register')}
                    >
                      Start Free Trial
                    </Button>
                    <Button size="large" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </Space>
                  <Row gutter={[24, 24]} className="hero-stats">
                    <Col span={8}>
                      <Statistic title="Properties Managed" value="50+" />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Happy Tenants" value="100+" />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Uptime" value="99.9%" />
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="hero-card">
                  <Title level={5}>Property Dashboard</Title>
                  <Space vertical style={{ width: '100%' }} size="middle">
                    <div className="metric">
                      <Text type="secondary">Total Properties</Text>
                      <Title level={3} style={{ margin: 0 }}>
                        12
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">Occupied Units</Text>
                      <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                        45/48
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">Monthly Revenue</Text>
                      <Title level={3} style={{ margin: 0 }}>
                        TZS 2,450,000
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">Outstanding</Text>
                      <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                        TZS 120,000
                      </Title>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <Title level={2}>Powerful Features</Title>
              <Paragraph>Everything you need to manage your properties efficiently</Paragraph>
            </div>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card className="feature-card" hoverable>
                    <div className="feature-icon">{feature.icon}</div>
                    <Title level={4}>{feature.title}</Title>
                    <Paragraph>{feature.description}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <Row align="middle" gutter={[48, 48]}>
              <Col xs={24} lg={12}>
                <Title level={2}>Why Choose Tanaka?</Title>
                <Paragraph>
                  We understand the challenges of property management in Tanzania. That's why we've built a platform specifically designed for local needs.
                </Paragraph>
                <Space vertical size="middle">
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>Local currency and payment methods</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>Swahili and English language support</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>Mobile-first design for accessibility</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>24/7 customer support</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="about-card">
                  <Title level={5}>Recent Activity</Title>
                  <Space vertical style={{ width: '100%' }}>
                    <div className="activity-item">
                      <UserAddOutlined style={{ color: '#1890ff' }} />
                      <Text>New tenant registered: John Mwamba</Text>
                    </div>
                    <div className="activity-item">
                      <CreditCardOutlined style={{ color: '#52c41a' }} />
                      <Text>Payment received: TZS 450,000</Text>
                    </div>
                    <div className="activity-item">
                      <ToolOutlined style={{ color: '#faad14' }} />
                      <Text>Maintenance request submitted</Text>
                    </div>
                    <div className="activity-item">
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text>Lease agreement renewed</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <Title level={2}>What Our Users Say</Title>
              <Paragraph>Join thousands of satisfied property managers and owners</Paragraph>
            </div>
            <Row gutter={[24, 24]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} lg={8} key={index}>
                  <Card className="testimonial-card">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarFilled key={i} style={{ color: '#faad14' }} />
                      ))}
                    </div>
                    <Paragraph className="testimonial-text">"{testimonial.text}"</Paragraph>
                    <div className="testimonial-author">
                      <Title level={5} style={{ margin: 0 }}>
                        {testimonial.name}
                      </Title>
                      <Text type="secondary">{testimonial.role}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <Title level={2} style={{ color: 'white' }}>
              Ready to Get Started?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 18 }}>
              Join thousands of property managers who trust Tanaka for their business
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/register')}>
                Start Free Trial
              </Button>
              <Button size="large" ghost onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </Space>
          </div>
        </section>
      </Content>

      {/* Footer */}
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
                    <a href="#features">Features</a>
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
              <a
                href="https://www.linkedin.com/company/tanakas"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinOutlined style={{ fontSize: 20 }} />
              </a>
              <a
                href="https://www.instagram.com/tanakatanzania"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramOutlined style={{ fontSize: 20 }} />
              </a>
              <a
                href="https://www.facebook.com/tanakatanzania"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookOutlined style={{ fontSize: 20 }} />
              </a>
            </Space>
          </div>
        </div>
      </Footer>

      {/* Floating Social Buttons */}
      <div className="floating-social">
        <a
          className="floating-btn floating-whatsapp"
          href="https://wa.me/255736450475"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <a
          className="floating-btn floating-youtube"
          href="https://www.youtube.com/@tanakatanzania"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch on YouTube"
          title="Watch on YouTube"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
          </svg>
        </a>
      </div>
    </Layout>
  );
};

export default Landing;
