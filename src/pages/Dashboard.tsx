import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getDashboardInfo } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import DashboardStats from '../components/dashboard/DashboardStats';
import ReportSalesChart from '../components/dashboard/ReportSalesChart';
import CostBreakdownChart from '../components/dashboard/CostBreakdownChart';
import SubscriptionBanner from '../components/SubscriptionBanner';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const { data: profileData } = useProfile();

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
      <DashboardStats data={dashboardData} loading={dashboardLoading} error={dashboardError} onRetry={refetchDashboard} />

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={14}>
          <ReportSalesChart data={dashboardData} loading={dashboardLoading} />
        </Col>
        <Col xs={24} lg={10}>
          <CostBreakdownChart data={dashboardData} loading={dashboardLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
