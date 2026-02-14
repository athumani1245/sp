import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  message,
  Tooltip,
  Card,
  Typography,
  Skeleton,
  Row,
  Col,
  Tour,
  Grid,
} from 'antd';
import type { TourProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import AddTenantModal from '../components/forms/AddTenantModal';
import MobileTenantsList from '../components/mobile/MobileTenantsList';
import { useTenants, useDeleteTenant } from '../hooks/useTenants';
import { useTour } from '../hooks/useTour';

const { Search } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { useBreakpoint } = Grid;

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  gender?: string;
  emergency_contacts: any[];
}

const Tenants: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();
  const { open: tourOpen, setOpen: setTourOpen, markTourCompleted } = useTour('tenants');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Tour refs
  const addButtonRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  // Tour steps configuration
  const tourSteps: TourProps['steps'] = [
    {
      title: 'Welcome to Tenants Management',
      description: 'Manage all your tenants in one place. Let\'s explore the key features!',
    },
    {
      title: 'Add New Tenant',
      description: 'Click here to add a new tenant. You can store contact information, emergency contacts, and other important details.',
      target: () => addButtonRef.current,
    },
    {
      title: 'Search Tenants',
      description: 'Quickly find tenants by searching their name, phone number, or email address.',
      target: () => searchRef.current,
    },
    {
      title: 'Tenants Table',
      description: 'View all your tenants with their contact information. Click on any row to see full details and history.',
      target: () => tableRef.current,
    },
  ];

  // Use TanStack Query hook
  const { data, isLoading, error } = useTenants({
    search,
    page,
    limit: 10,
  });

  const deleteTenantMutation = useDeleteTenant();

  // Ensure tenants is always an array
  const tenants = Array.isArray(data?.items) ? data?.items : [];
  const totalCount = data?.pagination?.total || 0;

  // Handle error state
  if (error) {
    console.error('Tenants fetch error:', error);
    messageApi.error('Failed to load tenants');
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPage(newPagination.current || 1);
  };

  const handleViewTenant = (tenantId: string) => {
    navigate(`/tenants/${tenantId}`);
  };

  const handleDelete = (tenantId: string, tenantName: string) => {
    confirm({
      title: 'Delete Tenant',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${tenantName}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        deleteTenantMutation.mutate(tenantId);
      },
    });
  };

  const handleTenantAdded = () => {
    setShowAddModal(false);
    messageApi.success('Tenant added successfully!');
  };

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#CC5B4B' }} />
          <Text strong>
            {record.first_name} {record.last_name}
          </Text>
        </Space>
      ),
      sorter: (a, b) => 
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: 'Phone',
      dataIndex: 'username',
      key: 'username',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        email ? (
          <Space>
            <MailOutlined />
            <Text>{email}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender || <Text type="secondary">-</Text>,
    },
    {
      title: 'Emergency Contacts',
      dataIndex: 'emergency_contacts',
      key: 'emergency_contacts',
      render: (contacts) => (
        <Text>{contacts?.length || 0}</Text>
      ),
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
                handleViewTenant(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id, `${record.first_name} ${record.last_name}`);
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
                <TeamOutlined /> Tenants
              </Title>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <div ref={addButtonRef}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddModal(true)}
                  size="large"
                >
                  Add New Tenant
                </Button>
              </div>
            </Col>
          </Row>
          <Text type="secondary">Manage your tenants and their information</Text>
        </Space>
      </div>

      {/* Search Section */}
      <Card style={{ marginBottom: '16px' }} ref={searchRef}>
        <Search
          placeholder="Search by name, phone, or email..."
          allowClear
          prefix={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </Card>

      {/* Tenants Table */}
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
            dataSource={tenants}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 10,
              total: totalCount,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            onRow={(record) => ({
              onClick: () => handleViewTenant(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <MobileTenantsList
            tenants={tenants || []}
            loading={false}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTenantAdded={handleTenantAdded}
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

export default Tenants;
