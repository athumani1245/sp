import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  Typography,
  message,
  Skeleton,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  BankOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import AddPropertyModal from '../components/forms/AddPropertyModal';
import { useProperties, useDeleteProperty } from '../hooks/useProperties';
import { useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { Search } = Input;

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

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Use TanStack Query hook
  const { data, isLoading, error, refetch } = useProperties({
    search,
    page,
    page_size: 10,
  });
  
  const deletePropertyMutation = useDeleteProperty();

  // Ensure properties is always an array
  const properties = Array.isArray(data?.items) ? data?.items : [];
  const totalCount = data?.pagination?.total || 0;

  // Handle error state
  if (error) {
    console.error('Properties fetch error:', error);
    messageApi.error('Failed to load properties');
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPage(newPagination.current || 1);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handlePropertyAdded = () => {
    setShowModal(false);
    messageApi.success('Property added successfully!');
  };

  const handleRefresh = async () => {
    messageApi.loading('Refreshing properties...', 0.5);
    await refetch();
    messageApi.success('Properties refreshed!');
  };
  
  const handleDeleteProperty = (propertyId: string) => {
    deletePropertyMutation.mutate(propertyId);
  };

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

  const columns: ColumnsType<Property> = [
    {
      title: 'Property Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <BankOutlined style={{ color: '#1890ff' }} />
          <Text strong>{record.property_name || 'N/A'}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.property_name || '').localeCompare(b.property_name || ''),
    },
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'property_type',
      render: (type: string) => getPropertyTypeTag(type),
      filters: [
        { text: 'Apartment', value: 'apartment' },
        { text: 'House', value: 'house' },
        { text: 'Commercial', value: 'commercial' },
        { text: 'Land', value: 'land' },
      ],
      onFilter: (value, record) => record.property_type === value,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <EnvironmentOutlined />
            <Text>{record.address?.region_name || 'N/A'}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {[record.address?.district_name, record.address?.ward_name, record.address?.street]
              .filter(Boolean)
              .join(', ') || 'No address'}
          </Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Units',
      key: 'units',
      dataIndex: 'units_count',
      render: (units: number) => (
        <Space>
          <HomeOutlined />
          <Text>{units || 0}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.units_count || 0) - (b.units_count || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewProperty(record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}

      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Title level={2} style={{ margin: 0 }}>
                <BankOutlined /> Properties
              </Title>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Space wrap>
                <Tooltip title="Refresh properties list">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={isLoading}
                    size="large"
                  >
                    Refresh
                  </Button>
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowModal(true)}
                  size="large"
                >
                  Add New Property
                </Button>
              </Space>
            </Col>
          </Row>
          <Text type="secondary">Manage your properties and their details</Text>
        </Space>
      </div>

      {/* Search Section */}
      <Card style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search by property name, location..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </Card>

      {/* Properties Table */}
      <Card>
        {isLoading ? (
          <div>
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={properties}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 10,
              total: totalCount,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            onRow={(record) => ({
              onClick: () => handleViewProperty(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Card>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />
    </div>
  );
};

export default Properties;
