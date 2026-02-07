import React from 'react';
import { List, Card, Tag, Space, Button, Tooltip, Typography, Empty } from 'antd';
import {
  BankOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface Address {
  region_name?: string;
  district_name?: string;
  ward_name?: string;
  street?: string;
}

interface Property {
  id: string;
  property_name: string;
  property_type: string;
  address: Address;
  units_count?: number;
  manager_id?: string;
}

interface MobilePropertiesListProps {
  properties: Property[];
  loading: boolean;
  onDelete: (propertyId: string) => void;
}

const MobilePropertiesList: React.FC<MobilePropertiesListProps> = ({
  properties,
  loading,
  onDelete,
}) => {
  const navigate = useNavigate();

  const getPropertyTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      apartment: { color: 'blue', text: 'Apartment' },
      house: { color: 'green', text: 'House' },
      commercial: { color: 'orange', text: 'Commercial' },
      land: { color: 'purple', text: 'Land' },
    };
    const config = typeConfig[type?.toLowerCase()] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getLocationText = (address: Address) => {
    if (address.district_name && address.region_name) {
      return `${address.district_name}, ${address.region_name}`;
    }
    if (address.region_name) return address.region_name;
    return 'Location not specified';
  };

  return (
    <List
      loading={loading}
      dataSource={properties}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No properties found"
          />
        ),
      }}
      renderItem={(property) => (
        <List.Item
          style={{ padding: 0, marginBottom: 12 }}
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          <Card
            hoverable
            style={{ width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Property Name & Type */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <BankOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15 }}>
                    {property.property_name}
                  </Text>
                </Space>
                {getPropertyTypeTag(property.property_type)}
              </Space>

              {/* Location */}
              <Space>
                <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {getLocationText(property.address)}
                </Text>
              </Space>

              {/* Units Count */}
              <Space>
                <HomeOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {property.units_count || 0} {property.units_count === 1 ? 'unit' : 'units'}
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
                      navigate(`/properties/${property.id}`);
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
                      onDelete(property.id);
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

export default MobilePropertiesList;
