import React, { useState } from 'react';
import { Typography, Row, Col, Space, Modal, Tag } from 'antd';
import { PlayCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import '../assets/styles/academy.css';

const { Title, Paragraph, Text } = Typography;

export const CHANNEL_URL = 'https://www.youtube.com/@TanakaTanzania';

export interface Lesson {
  id: string; // YouTube video id
  title: string;
  duration: string;
  description: string;
  goal: string;
}

// Videos from the Tanaka YouTube channel — add new uploads here
export const gettingStarted: Lesson[] = [
  {
    id: 'Q_KmAIyoeUM',
    title: 'Mfumo wa Tanaka ni mfumo wa aina gani',
    duration: '1:16',
    description: 'An introduction to Tanaka and what it does for landlords and property managers.',
    goal: 'Understand what Tanaka can do for you',
  },
  {
    id: '6-OCAfqK6Rg',
    title: 'Namna ya kulipia mfumo',
    duration: '1:02',
    description: 'How to pay for your Tanaka subscription.',
    goal: 'Subscription active',
  },
  {
    id: 'VlQN4XtEQAA',
    title: 'Namna ya kuweka chumba au vyumba kwenye mfumo wa Tanaka',
    duration: '1:21',
    description: 'Add a unit, or several units, to your property.',
    goal: 'Your units are set up',
  },
  {
    id: 'hjqJ7i2aLg0',
    title: 'Jinsi ya kuweka taarifa za wapangaji kwenye Mfumo wa Tanaka',
    duration: '1:57',
    description: 'Record your tenants and their details.',
    goal: 'Tenants added to the system',
  },
  {
    id: 'i5UV8moMk7g',
    title: 'Jinsi ya kutengeneza Mkataba kwenye Mfumo wa Tanaka',
    duration: '2:12',
    description: 'Create a Lease to keep your records organised.',
    goal: 'Lease created',
  },
  {
    id: 'S55A1O4_8Zk',
    title: 'Namna ya kukuweka malipo au makusanyo ya kodi au internet au Maji kwenye mfumo website',
    duration: '1:05',
    description: 'Record rent, internet and water payments and collections.',
    goal: 'Payments are being tracked',
  },
  {
    id: 'LUUOH0F33v4',
    title: 'Namna ya kusoma Dashboard kwenye mfumo wa Tanaka',
    duration: '1:25',
    description: 'Read your dashboard: occupancy, revenue and outstanding balances at a glance.',
    goal: 'Know where your business stands',
  },
];

export const goingFurther: Lesson[] = [
  {
    id: 'EPXChbzVZAA',
    title: 'Andika, Hifadhi na Chapisha Mkataba wa Mpangaji kwa Dakika Chache Tu!',
    duration: '7:20',
    description: 'Write, save and print a tenant lease agreement in a few minutes.',
    goal: 'A signed-ready lease agreement',
  },
  {
    id: 'WDApfHe_45M',
    title: 'Jinsi ya kusoma Taarifa za Mkataba',
    duration: '1:50',
    description: 'Read the lease report: terms, months covered and expiry dates.',
    goal: 'Stay on top of every lease',
  },
];

const LessonCard: React.FC<{ lesson: Lesson; episode: number; onPlay: (l: Lesson) => void }> = ({
  lesson,
  episode,
  onPlay,
}) => (
  <button type="button" className="academy-lesson" onClick={() => onPlay(lesson)}>
    <div className="academy-thumb">
      <img src={`https://i.ytimg.com/vi/${lesson.id}/hqdefault.jpg`} alt={lesson.title} loading="lazy" />
      <PlayCircleFilled className="academy-play" />
    </div>
    <div className="academy-lesson-body">
      <Space size={8} wrap className="academy-meta">
        <Tag color="#CC5B4B">Episode {episode}</Tag>
        <Text type="secondary">
          <ClockCircleOutlined /> {lesson.duration}
        </Text>
        <Text type="secondary">🇹🇿 Swahili</Text>
      </Space>
      <Title level={4} className="academy-lesson-title">
        {lesson.title}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        {lesson.description}
      </Paragraph>
      <Text>
        <strong>Goal:</strong> {lesson.goal}
      </Text>
    </div>
  </button>
);

// Lesson grid with its own video player modal
export const LessonGrid: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const [playing, setPlaying] = useState<Lesson | null>(null);

  return (
    <>
      <Row gutter={[24, 24]}>
        {lessons.map((lesson, i) => (
          <Col xs={24} sm={12} lg={8} key={lesson.id}>
            <LessonCard lesson={lesson} episode={i + 1} onPlay={setPlaying} />
          </Col>
        ))}
      </Row>

      <Modal
        open={!!playing}
        onCancel={() => setPlaying(null)}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        title={playing?.title}
      >
        {playing && (
          <div className="academy-player">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
              title={playing.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </>
  );
};
