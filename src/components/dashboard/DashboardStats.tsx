import React from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { HomeOutlined, DollarOutlined, FileTextOutlined, KeyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DashboardStatsProps {
  data: any;
  loading: boolean;
  error: any;
  onRetry: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, loading, error, onRetry }) => {
  if (error) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '8px' }}>
        <Text type="danger">
          {error.message || 'Failed to load statistics'}
        </Text>
        <button
          style={{ marginLeft: '16px', padding: '4px 12px', fontSize: '12px' }}
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = {
    totalProperty: data?.summary?.total_number_of_properties || 0,
    totalUnits: data?.summary?.total_units || 0,
    occupiedUnits: data?.summary?.occupied_units || 0,
    vacantUnits: data?.summary?.vacant_units || 0,
    totalLeases: data?.summary?.total_active_leases || 0,
    totalRevenue: data?.summary?.total_revenue || 0,
    totalOutstanding: data?.summary?.total_outstanding_payment || 0,
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    if (amount >= 1000000) {
      return `TSh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `TSh ${(amount / 1000).toFixed(0)}k`;
    }
    return `TSh ${amount.toLocaleString()}`;
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      {/* Properties & Units */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading} style={{ borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HomeOutlined style={{ fontSize: '20px', color: '#666' }} />
            </div>
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>Properties & Units</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Statistic value={stats.totalProperty} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>properties</Text>
            <Text style={{ fontSize: '18px', color: '#E5E7EB' }}>|</Text>
            <Statistic value={stats.totalUnits} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>units</Text>
          </div>
        </Card>
      </Col>

      {/* Occupancy */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading} style={{ borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyOutlined style={{ fontSize: '20px', color: '#666' }} />
            </div>
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>Occupancy</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Statistic value={stats.occupiedUnits} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>occupied</Text>
            <Text style={{ fontSize: '18px', color: '#E5E7EB' }}>|</Text>
            <Statistic value={stats.vacantUnits} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>vacant</Text>
          </div>
        </Card>
      </Col>

      {/* Total Active Leases */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading} style={{ borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileTextOutlined style={{ fontSize: '20px', color: '#666' }} />
            </div>
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>Total Active Leases</Text>
          </div>
          <Statistic value={stats.totalLeases} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
        </Card>
      </Col>

      {/* Revenue */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading} style={{ borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarOutlined style={{ fontSize: '20px', color: '#666' }} />
            </div>
            <Text style={{ fontSize: '14px', color: '#6B7280' }}>Revenue</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <div>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
              <br />
              <Text style={{ fontSize: '11px', color: '#6B7280' }}>revenue</Text>
            </div>
            <Text style={{ fontSize: '16px', color: '#E5E7EB' }}>|</Text>
            <div>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#EF4444' }}>
                {formatCurrency(stats.totalOutstanding)}
              </Text>
              <br />
              <Text style={{ fontSize: '11px', color: '#6B7280' }}>outstanding</Text>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;
