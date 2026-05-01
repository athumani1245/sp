import React from 'react';
import { List, Card, Space, Button, Tooltip, Typography, Empty } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface PropertyManager {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
}

interface MobilePropertyManagersListProps {
  managers: PropertyManager[];
  loading: boolean;
  onDelete: (managerId: string, managerName: string) => void;
  onView?: (managerId: string) => void;
}

const MobilePropertyManagersList: React.FC<MobilePropertyManagersListProps> = ({
  managers,
  loading,
  onDelete,
  onView,
}) => {
  const navigate = useNavigate();

  return (
    <List
      loading={loading}
      dataSource={managers}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No property managers found"
          />
        ),
      }}
      renderItem={(manager) => (
        <List.Item
          style={{ padding: 0, marginBottom: 12 }}
          onClick={() => onView ? onView(manager.id) : navigate(`/property-managers/${manager.id}`)}
        >
          <Card
            hoverable
            style={{ width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Manager Name */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <UserOutlined style={{ color: '#CC5B4B', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>
                    {manager.first_name} {manager.last_name}
                  </Text>
                </Space>
              </Space>

              {/* Phone */}
              <Space>
                <PhoneOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {manager.username}
                </Text>
              </Space>

              {/* Email */}
              {manager.email && (
                <Space>
                  <MailOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {manager.email}
                  </Text>
                </Space>
              )}

              {/* Actions */}
              <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 4 }}>
                <Tooltip title="View Details">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView ? onView(manager.id) : navigate(`/property-managers/${manager.id}`);
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
                      onDelete(manager.id, `${manager.first_name} ${manager.last_name}`);
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

export default MobilePropertyManagersList;
