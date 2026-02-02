import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Tour } from 'antd';
import type { TourProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getDashboardInfo } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useTour } from '../hooks/useTour';
import DashboardStats from '../components/dashboard/DashboardStats';
import ReportSalesChart from '../components/dashboard/ReportSalesChart';
import CostBreakdownChart from '../components/dashboard/CostBreakdownChart';
import SubscriptionBanner from '../components/SubscriptionBanner';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const { data: profileData } = useProfile();
  const { open: tourOpen, setOpen: setTourOpen, markTourCompleted } = useTour('dashboard');
  
  // Refs for tour targets
  const statsRef = useRef(null);
  const salesChartRef = useRef(null);
  const costChartRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['dashboardInfo'],
    queryFn: async () => {
      const result = await getDashboardInfo();
      if (result.success) return result.data;
      throw new Error(result.error || 'Failed to load dashboard data');
    },
    staleTime: 2 * 60 * 1000,
  });

  const getUserName = () => {
    if (profileData?.first_name) {
      return `${profileData.first_name} ${profileData.last_name || ''}`.trim();
    }
    return 'User';
  };

  const tourSteps: TourProps['steps'] = [
    {
      title: 'Welcome to Your Dashboard!',
      description: 'This is your central hub where you can view all important information about your property management at a glance.',
      target: null,
    },
    {
      title: 'Dashboard Statistics',
      description: 'Here you can see key metrics like total properties, active leases, total tenants, and monthly revenue. These cards give you a quick overview of your business.',
      target: () => statsRef.current,
    },
    {
      title: 'Sales Report Chart',
      description: 'This chart shows your monthly revenue trends, helping you track your income over time.',
      target: () => salesChartRef.current,
    },
    {
      title: 'Cost Breakdown',
      description: 'View your cost distribution across different categories like rent, utilities, and maintenance.',
      target: () => costChartRef.current,
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Subscription Banner */}
      <SubscriptionBanner />

      {/* Welcome Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#1a1a1a', marginBottom: '8px', fontSize: window.innerWidth < 768 ? '20px' : '28px' }}>
          Hello, {getUserName()}!
        </Title>
        <Text style={{ fontSize: window.innerWidth < 768 ? '12px' : '14px', color: '#6B7280' }}>
          Explore General information about your properties and leases below.
        </Text>
      </div>

      {/* Stats Cards */}
      <div ref={statsRef}>
        <DashboardStats data={dashboardData} loading={dashboardLoading} error={dashboardError} onRetry={refetchDashboard} />
      </div>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={14}>
          <div ref={salesChartRef}>
            <ReportSalesChart data={dashboardData} loading={dashboardLoading} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div ref={costChartRef}>
            <CostBreakdownChart data={dashboardData} loading={dashboardLoading} />
          </div>
        </Col>
      </Row>

      {/* Tour */}
      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={markTourCompleted}
        steps={tourSteps}
      />
    </div>
  );
};

export default Dashboard;
