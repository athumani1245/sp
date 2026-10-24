import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Space } from 'antd';
import '../assets/styles/Landing.css';
import FloatingSocial from '../components/FloatingSocial';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { LessonGrid, gettingStarted, goingFurther, CHANNEL_URL } from '../components/AcademyLessons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Academy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout className="landing-page">
      <SiteHeader />

      <Content>
        <section className="academy-hero">
          <div className="container">
            <Title level={1} className="hero-title">
              Tanaka <span className="text-primary">Academy</span>
            </Title>
            <Paragraph className="hero-description">
              Video lessons to get the most out of Tanaka. Follow the series in order, or jump straight to the lesson you need.
            </Paragraph>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            {/* <div className="section-header">
              <Title level={2}>Getting started from sign-up to your first payment</Title>
              <Paragraph>{gettingStarted.length} short lessons in Swahili, about 10 minutes in total.</Paragraph>
            </div> */}
            <LessonGrid lessons={gettingStarted} />
          </div>
        </section>

        <section className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <Title level={2}>Going further.. leases & reports</Title>
              <Paragraph>Deeper lessons on lease agreements and keeping track of them.</Paragraph>
            </div>
            <LessonGrid lessons={goingFurther} />
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <Title level={2} style={{ color: 'white' }}>
              Ready to get started?
            </Title>
            <Paragraph style={{ color: 'white', fontSize: 18 }}>
              Put what you've learned into practice — create your Tanaka account today.
            </Paragraph>
            <Space size="large" wrap style={{ justifyContent: 'center' }}>
              <Button type="primary" size="large" onClick={() => navigate('/register')}>
                Get Started
              </Button>
              <Button size="large" ghost href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                More on YouTube
              </Button>
            </Space>
          </div>
        </section>
      </Content>

      <SiteFooter />

      <FloatingSocial />
    </Layout>
  );
};

export default Academy;
