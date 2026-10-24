import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { PlayCircleOutlined, YoutubeOutlined } from '@ant-design/icons';
import { LessonGrid, gettingStarted, goingFurther, CHANNEL_URL } from '../components/AcademyLessons';

const { Title, Paragraph } = Typography;

// In-app Academy for logged-in users; same lessons as the public /academy page
const AppAcademy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '24px' }}>
      <Space vertical size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0 }}>
              <PlayCircleOutlined /> {t('common:nav.academy')}
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button icon={<YoutubeOutlined />} href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              YouTube
            </Button>
          </Col>
        </Row>

        <Card>
          <Paragraph type="secondary">
            Video lessons to get the most out of Tanaka. Follow the series in order, or jump straight to the lesson you need.
          </Paragraph>
          <LessonGrid lessons={gettingStarted} />
        </Card>

        <Card title="Going further.. leases & reports">
          <LessonGrid lessons={goingFurther} />
        </Card>
      </Space>
    </div>
  );
};

export default AppAcademy;
