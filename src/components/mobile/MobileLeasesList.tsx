import React from 'react';
import { List, Card, Tag, Space, Button, Typography, Empty, Divider } from 'antd';
import {
  FileTextOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Lease {
  id: string;
  lease_number: string;
  property?: {
    id: string;
    property_name: string;
  };
  unit?: {
    unit_name?: string;
    unit_number?: string;
  };
  tenant?: {
    first_name?: string;
    last_name?: string;
  };
  start_date: string;
  end_date: string;
  total_amount: number;
  amount_paid: number;
  remaining_amount?: number;
  status: string;
}

interface MobileLeasesListProps {
  leases: Lease[];
  loading: boolean;
}

const MobileLeasesList: React.FC<MobileLeasesListProps> = ({
  leases,
  loading,
}) => {
  const navigate = useNavigate();

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Active' },
      draft: { color: 'default', text: 'Draft' },
      expired: { color: 'error', text: 'Expired' },
      terminated: { color: 'default', text: 'Terminated' },
      cancelled: { color: 'warning', text: 'Cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  const getUnitInfo = (lease: Lease) => {
    if (!lease.unit) return 'Unknown Unit';
    if (lease.unit.unit_name) return lease.unit.unit_name;
    if (lease.unit.unit_number) return `Unit ${lease.unit.unit_number}`;
    return 'Unknown Unit';
  };

  const getTenantName = (lease: Lease) => {
    if (!lease.tenant) return 'Unknown Tenant';
    return `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() || 'Unknown Tenant';
  };

  return (
    <List
      loading={loading}
      dataSource={leases}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No leases found"
          />
        ),
      }}
      renderItem={(lease) => (
        <List.Item
          style={{ padding: 0, marginBottom: 12 }}
          onClick={() => navigate(`/leases/${lease.id}`)}
        >
          <Card
            hoverable
            style={{ width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Lease Number & Status */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>
                    {lease.lease_number}
                  </Text>
                </Space>
                {getStatusTag(lease.status)}
              </Space>

              {/* Property */}
              <Space>
                <HomeOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {lease.property?.property_name || 'Unknown Property'} - {getUnitInfo(lease)}
                </Text>
              </Space>

              {/* Tenant */}
              <Space>
                <UserOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {getTenantName(lease)}
                </Text>
              </Space>

              {/* Period */}
              <Space>
                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
                </Text>
              </Space>

              <Divider style={{ margin: '8px 0' }} />

              {/* Financial Info */}
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Amount Paid:</Text>
                  <Text strong style={{ fontSize: 13, color: '#52c41a' }}>
                    {formatCurrency(lease.amount_paid)}
                  </Text>
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Balance:</Text>
                  <Text strong style={{ fontSize: 13, color: '#ff4d4f' }}>
                    {formatCurrency((lease.remaining_amount || 0))}
                  </Text>
                </Space>
              </Space>

              {/* View Button */}
              <Button
                type="primary"
                block
                size="small"
                style={{ marginTop: 4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/leases/${lease.id}`);
                }}
              >
                View Details
              </Button>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default MobileLeasesList;
