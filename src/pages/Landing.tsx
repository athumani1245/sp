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
import { useTranslation } from 'react-i18next';
import '../assets/styles/Landing.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: <HomeOutlined />,
      title: t('landing:features.propertyManagement.title'),
      description: t('landing:features.propertyManagement.description'),
    },
    {
      icon: <TeamOutlined />,
      title: t('landing:features.tenantManagement.title'),
      description: t('landing:features.tenantManagement.description'),
    },
    {
      icon: <CalendarOutlined />,
      title: t('landing:features.leaseTracking.title'),
      description: t('landing:features.leaseTracking.description'),
    },
    {
      icon: <CreditCardOutlined />,
      title: t('landing:features.paymentTracking.title'),
      description: t('landing:features.paymentTracking.description'),
    },
    {
      icon: <ToolOutlined />,
      title: t('landing:features.maintenanceRequests.title'),
      description: t('landing:features.maintenanceRequests.description'),
    },
    {
      icon: <LineChartOutlined />,
      title: t('landing:features.analytics.title'),
      description: t('landing:features.analytics.description'),
    },
  ];

  const testimonials = [
    {
      name: t('landing:testimonials.testimonial1.name'),
      role: t('landing:testimonials.testimonial1.role'),
      text: t('landing:testimonials.testimonial1.text'),
      rating: 5,
    },
    {
      name: t('landing:testimonials.testimonial2.name'),
      role: t('landing:testimonials.testimonial2.role'),
      text: t('landing:testimonials.testimonial2.text'),
      rating: 5,
    },
    {
      name: t('landing:testimonials.testimonial3.name'),
      role: t('landing:testimonials.testimonial3.role'),
      text: t('landing:testimonials.testimonial3.text'),
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
              <a href="#features">{t('landing:nav.features')}</a>
              <a href="#about">{t('landing:nav.about')}</a>
              <a href="#testimonials">{t('landing:nav.testimonials')}</a>
              <a href="#contact">{t('landing:nav.contact')}</a>
            </nav>
            <Space>
              <Button onClick={() => navigate('/login')}>{t('landing:nav.login')}</Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                {t('landing:nav.getStarted')}
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
                    {t('landing:hero.title')} <span className="text-primary">{t('landing:hero.titleHighlight')}</span>
                  </Title>
                  <Paragraph className="hero-description">
                    {t('landing:hero.description')}
                  </Paragraph>
                  <Space size="large" className="hero-buttons">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate('/register')}
                    >
                      {t('landing:hero.startFreeTrial')}
                    </Button>
                    <Button size="large" onClick={() => navigate('/login')}>
                      {t('landing:hero.signIn')}
                    </Button>
                  </Space>
                  <Row gutter={[24, 24]} className="hero-stats">
                    <Col span={8}>
                      <Statistic title={t('landing:hero.stats.propertiesManaged')} value="50+" />
                    </Col>
                    <Col span={8}>
                      <Statistic title={t('landing:hero.stats.happyTenants')} value="100+" />
                    </Col>
                    <Col span={8}>
                      <Statistic title={t('landing:hero.stats.uptime')} value="99.9%" />
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="hero-card">
                  <Title level={5}>{t('landing:hero.dashboard.title')}</Title>
                  <Space vertical style={{ width: '100%' }} size="middle">
                    <div className="metric">
                      <Text type="secondary">{t('landing:hero.dashboard.totalProperties')}</Text>
                      <Title level={3} style={{ margin: 0 }}>
                        12
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">{t('landing:hero.dashboard.occupiedUnits')}</Text>
                      <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                        45/48
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">{t('landing:hero.dashboard.monthlyRevenue')}</Text>
                      <Title level={3} style={{ margin: 0 }}>
                        TZS 2,450,000
                      </Title>
                    </div>
                    <div className="metric">
                      <Text type="secondary">{t('landing:hero.dashboard.outstanding')}</Text>
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
              <Title level={2}>{t('landing:features.title')}</Title>
              <Paragraph>{t('landing:features.subtitle')}</Paragraph>
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
                <Title level={2}>{t('landing:about.title')}</Title>
                <Paragraph>
                  {t('landing:about.description')}
                </Paragraph>
                <Space vertical size="middle">
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>{t('landing:about.features.localCurrency')}</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>{t('landing:about.features.language')}</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>{t('landing:about.features.mobileFirst')}</Text>
                  </div>
                  <div className="about-feature">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    <Text>{t('landing:about.features.support')}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="about-card">
                  <Title level={5}>{t('landing:about.recentActivity.title')}</Title>
                  <Space vertical style={{ width: '100%' }}>
                    <div className="activity-item">
                      <UserAddOutlined style={{ color: '#1890ff' }} />
                      <Text>{t('landing:about.recentActivity.newTenant')}</Text>
                    </div>
                    <div className="activity-item">
                      <CreditCardOutlined style={{ color: '#52c41a' }} />
                      <Text>{t('landing:about.recentActivity.paymentReceived')}</Text>
                    </div>
                    <div className="activity-item">
                      <ToolOutlined style={{ color: '#faad14' }} />
                      <Text>{t('landing:about.recentActivity.maintenanceRequest')}</Text>
                    </div>
                    <div className="activity-item">
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text>{t('landing:about.recentActivity.leaseRenewed')}</Text>
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
              <Title level={2}>{t('landing:testimonials.title')}</Title>
              <Paragraph>{t('landing:testimonials.subtitle')}</Paragraph>
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
              {t('landing:cta.title')}
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 18 }}>
              {t('landing:cta.description')}
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/register')}>
                {t('landing:cta.startFreeTrial')}
              </Button>
              <Button size="large" ghost onClick={() => navigate('/login')}>
                {t('landing:cta.signIn')}
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
              <Paragraph style={{ color: 'white' }}>{t('landing:footer.tagline')}</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5}>{t('landing:footer.contact')}</Title>
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
              <Title level={5}>{t('landing:footer.quickLinks')}</Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Space vertical>
                    <a href="#features">{t('landing:footer.features')}</a>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space vertical>
                    <a href="/privacy-policy">{t('landing:footer.privacy')}</a>
                    <a href="#contact">{t('landing:footer.support')}</a>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="footer-bottom">
            <Text style={{ color: 'white' }}  >© {new Date().getFullYear()} Tanaka. {t('landing:footer.copyright')}</Text>
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
    </Layout>
  );
};

export default Landing;
