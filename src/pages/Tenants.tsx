import React, { useState } from 'react';
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
} from 'antd';
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
import { useTenants, useDeleteTenant } from '../hooks/useTenants';

const { Search } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

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
  const [messageApi, contextHolder] = message.useMessage();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

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
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Title level={2} style={{ margin: 0 }}>
                <TeamOutlined /> Tenants
              </Title>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddModal(true)}
                size="large"
              >
                Add New Tenant
              </Button>
            </Col>
          </Row>
          <Text type="secondary">Manage your tenants and their information</Text>
        </Space>
      </div>

      {/* Search Section */}
      <Card style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search by name, phone, or email..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </Card>

      {/* Tenants Table */}
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
        )}
      </Card>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTenantAdded={handleTenantAdded}
      />
    </div>
  );
};

export default Tenants;
