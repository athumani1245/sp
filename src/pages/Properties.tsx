import React, { useState, useRef } from 'react';
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
  Tour,
  Grid,
  Select,
} from 'antd';
import type { TourProps } from 'antd';
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
import MobilePropertiesList from '../components/mobile/MobilePropertiesList';
import { useAllProperties, useDeleteProperty } from '../hooks/useProperties';
import { useQueryClient } from '@tanstack/react-query';
import { useTour } from '../hooks/useTour';

const { Title, Text } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

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
  const { open: tourOpen, setOpen: setTourOpen, markTourCompleted } = useTour('properties');
  const screens = useBreakpoint();

  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 10;
  
  // Tour refs
  const addButtonRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  // Tour steps configuration
  const tourSteps: TourProps['steps'] = [
    {
      title: 'Welcome to Properties Management',
      description: 'This is where you can manage all your properties. Let\'s take a quick tour to show you around!',
    },
    {
      title: 'Add New Property',
      description: 'Click here to add a new property to your portfolio. You can add apartments, houses, commercial buildings, or land.',
      target: () => addButtonRef.current,
    },
    {
      title: 'Search Properties',
      description: 'Use this search bar to quickly find properties by name or location. Results update as you type.',
      target: () => searchRef.current,
    },
    {
      title: 'Properties Table',
      description: 'View all your properties here with details like type, location, and number of units. Click on any row to view more details.',
      target: () => tableRef.current,
    },
  ];

  // Use TanStack Query hook - fetch all properties
  const { data: allPropertiesData, isLoading, error, refetch } = useAllProperties();
  
  const deletePropertyMutation = useDeleteProperty();

  // Ensure properties is always an array
  const allProperties: Property[] = (allPropertiesData as Property[]) || [];
  
  // Filter properties by search and type on the client side
  const filteredProperties: Property[] = allProperties.filter(p => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = p.property_name?.toLowerCase().includes(searchLower);
      const matchesLocation = p.address?.region_name?.toLowerCase().includes(searchLower) ||
                             p.address?.district_name?.toLowerCase().includes(searchLower) ||
                             p.address?.ward_name?.toLowerCase().includes(searchLower) ||
                             p.address?.street?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesLocation) return false;
    }
    
    // Type filter
    if (propertyType && p.property_type !== propertyType) return false;
    
    return true;
  });
  
  // Client-side pagination
  const totalCount = filteredProperties.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const properties: Property[] = filteredProperties.slice(startIndex, endIndex);

  // Property type options matching AddPropertyModal
  const propertyTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Standalone', value: 'Standalone' },
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Commercial building', value: 'Commercial building' },
  ];

  // Handle error state
  if (error) {
    console.error('Properties fetch error:', error);
    messageApi.error('Failed to load properties');
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePropertyTypeChange = (value: string) => {
    setPropertyType(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPropertyType('');
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
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <Space vertical size={0}>
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
        <Space vertical size="small" style={{ width: '100%' }}>
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
                <div ref={addButtonRef}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowModal(true)}
                    size="large"
                  >
                    Add New Property
                  </Button>
                </div>
              </Space>
            </Col>
          </Row>
          <Text type="secondary">Manage your properties and their details</Text>
        </Space>
      </div>

      {/* Search and Filters Section */}
      <Card style={{ marginBottom: '16px' }} ref={searchRef}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12}>
              <Search
                placeholder="Search by property name, location..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Type"
                allowClear
                size="large"
                value={propertyType || undefined}
                onChange={handlePropertyTypeChange}
                style={{ width: '100%' }}
                options={propertyTypeOptions}
                disabled={isLoading}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                size="large"
                onClick={handleClearFilters}
                style={{ width: '100%' }}
                disabled={!search && !propertyType}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
          {(search || propertyType) && (
            <Text type="secondary">
              Showing {totalCount} result{totalCount !== 1 ? 's' : ''}
              {search && ` for "${search}"`}
              {propertyType && ` in ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`}
            </Text>
          )}
        </Space>
      </Card>

      {/* Properties Table */}
      <Card ref={tableRef}>
        {isLoading ? (
          <div>
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ) : screens.md ? (
          <Table
            columns={columns}
            dataSource={properties}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalCount,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            onRow={(record) => ({
              onClick: () => handleViewProperty(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <MobilePropertiesList
            properties={properties || []}
            loading={false}
            onDelete={handleDeleteProperty}
          />
        )}
      </Card>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />

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

export default Properties;
