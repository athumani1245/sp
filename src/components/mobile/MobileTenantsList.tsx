import React from 'react';
import { List, Card, Space, Button, Tooltip, Typography, Empty, Tag } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  gender?: string;
  emergency_contacts: any[];
}

interface MobileTenantsListProps {
  tenants: Tenant[];
  loading: boolean;
  onDelete: (tenantId: string, tenantName: string) => void;
}

const MobileTenantsList: React.FC<MobileTenantsListProps> = ({
  tenants,
  loading,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <List
      loading={loading}
      dataSource={tenants}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tenants found"
          />
        ),
      }}
      renderItem={(tenant) => (
        <List.Item
          style={{ padding: 0, marginBottom: 12 }}
          onClick={() => navigate(`/tenants/${tenant.id}`)}
        >
          <Card
            hoverable
            style={{ width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Tenant Name & Gender */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <UserOutlined style={{ color: '#CC5B4B', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>
                    {tenant.first_name} {tenant.last_name}
                  </Text>
                </Space>
                {tenant.gender && (
                  <Tag color="blue">{tenant.gender}</Tag>
                )}
              </Space>

              {/* Phone */}
              <Space>
                <PhoneOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {tenant.username}
                </Text>
              </Space>

              {/* Email */}
              {tenant.email && (
                <Space>
                  <MailOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {tenant.email}
                  </Text>
                </Space>
              )}

              {/* Emergency Contacts */}
              <Space>
                <TeamOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {tenant.emergency_contacts?.length || 0} emergency contact(s)
                </Text>
              </Space>

              {/* Actions */}
              <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 4 }}>
                <Tooltip title="View Details">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tenants/${tenant.id}`);
                    }}
                  >
                    View
                  </Button>
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tenant.id, `${tenant.first_name} ${tenant.last_name}`);
                    }}
                  />
                </Tooltip>
              </Space>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default MobileTenantsList;
