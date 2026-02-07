import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  Select,
  Tooltip,
  Skeleton,
  Tour,
  Grid,
} from 'antd';
import type { TourProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  HomeOutlined,
  CalendarOutlined,
  WarningOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import AddLeaseModal from '../components/forms/AddLeaseModal';
import MobileLeasesList from '../components/mobile/MobileLeasesList';
import { useLeases, useDeleteLease } from '../hooks/useLeases';
import { useTour } from '../hooks/useTour';
import dayjs from 'dayjs';

const { Search } = Input;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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

const Leases: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { open: tourOpen, setOpen: setTourOpen, markTourCompleted } = useTour('leases');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);

  // Tour refs
  const addButtonRef = useRef(null);
  const filtersRef = useRef(null);
  const tableRef = useRef(null);

  // Tour steps configuration
  const tourSteps: TourProps['steps'] = [
    {
      title: 'Welcome to Leases Management',
      description: 'Track and manage all your property leases here. Let\'s walk through the main features!',
    },
    {
      title: 'Add New Lease',
      description: 'Click here to create a new lease agreement. You can assign properties, tenants, and set payment terms.',
      target: () => addButtonRef.current,
    },
    {
      title: 'Filter Options',
      description: 'Use search and status filters to quickly find specific leases. Filter by active, expired, or other statuses.',
      target: () => filtersRef.current,
    },
    {
      title: 'Leases List',
      description: 'View all lease details including rent amounts, payment status, and lease periods. Click any row for more details.',
      target: () => tableRef.current,
    },
  ];

  // Fetch leases with TanStack Query
  const { data, isLoading, refetch } = useLeases({
    search,
    status: statusFilter,
    page,
    limit: pageSize,
  });

  // Delete mutation
  const deleteMutation = useDeleteLease();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleViewLease = (leaseId: string) => {
    navigate(`/leases/${leaseId}`);
  };

  const handleDeleteClick = (lease: Lease) => {
    setSelectedLease(lease);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLease) {
      await deleteMutation.mutateAsync(selectedLease.id);
      setDeleteModalVisible(false);
      setSelectedLease(null);
    }
  };

  const handleLeaseAdded = () => {
    setShowAddModal(false);
    refetch();
  };

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
    // API returns dates in DD-MM-YYYY format, parse accordingly
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
    if (lease.tenant.first_name && lease.tenant.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return 'Unknown Tenant';
  };

  const columns: ColumnsType<Lease> = [
    {
      title: 'Lease #',
      dataIndex: 'lease_number',
      key: 'lease_number',
      render: (text: string) => <Text strong>{text || 'N/A'}</Text>,
      width: 140,
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => (
        <Space vertical size={0}>
          <Text>{record.property?.property_name || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {getUnitInfo(record)}
          </Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text>{getTenantName(record)}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <Space vertical size={0}>
          <Text style={{ fontSize: '12px' }}>
            <CalendarOutlined /> {formatDate(record.start_date)}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            to {formatDate(record.end_date)}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Rent Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <Text>{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount: number) => <Text type="success">{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => {
        const balance = record.total_amount - record.amount_paid;
        return <Text type={balance > 0 ? 'danger' : 'secondary'}>{formatCurrency(balance)}</Text>;
      },
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      width: 100,
    },
    {
      title: 'Amount Remaining',
      key: 'amount_remaining',
      fixed: 'right',
      width: 150,
      render: (_, record) => {
        const remaining = record.total_amount - record.amount_paid;
        return (
          <Text strong type={remaining > 0 ? 'danger' : 'success'}>
            {formatCurrency(remaining)}
          </Text>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space vertical size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined /> Leases
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right', marginTop: window.innerWidth < 576 ? 16 : 0 }}>
            <div ref={addButtonRef}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
                Add Lease
              </Button>
            </div>
          </Col>
        </Row>


        {/* Filters */}
        <Card ref={filtersRef}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={10}>
              <Search
                placeholder="Search by lease number, tenant, or property..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: '100%' }}
                value={statusFilter || undefined}
                onChange={handleStatusChange}
              >
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="expired">Expired</Select.Option>
                <Select.Option value="terminated">Terminated</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
                <Select.Option value="draft">Draft</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ width: '100%' }}>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Leases Table */}
        <Card ref={tableRef}>
          {isLoading ? (
            <div>
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ) : screens.md ? (
            <Table<Lease>
              columns={columns}
              dataSource={Array.isArray(data?.items) ? data?.items : []}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: data?.pagination?.total || 0,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} leases`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              onRow={(record) => ({
                onClick: () => handleViewLease(record.id),
                style: { cursor: 'pointer' },
              })}
            />
          ) : (
            <MobileLeasesList
              leases={(data?.items as Lease[]) || []}
              loading={false}
            />
          )}
        </Card>
      </Space>

      {/* Add Lease Modal */}
      <AddLeaseModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleLeaseAdded}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Lease"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedLease(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <p>
          Are you sure you want to delete lease <strong>{selectedLease?.lease_number}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

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

export default Leases;
