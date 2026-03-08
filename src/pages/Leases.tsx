import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title: t('leases:leases.tourWelcomeTitle'),
      description: t('leases:leases.tourWelcomeDesc'),
    },
    {
      title: t('leases:leases.tourAddTitle'),
      description: t('leases:leases.tourAddDesc'),
      target: () => addButtonRef.current,
    },
    {
      title: t('leases:leases.tourFiltersTitle'),
      description: t('leases:leases.tourFiltersDesc'),
      target: () => filtersRef.current,
    },
    {
      title: t('leases:leases.tourTableTitle'),
      description: t('leases:leases.tourTableDesc'),
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
      active: { color: 'success', text: t('leases:leases.active') },
      draft: { color: 'default', text: t('leases:leases.draft') },
      expired: { color: 'error', text: t('leases:leases.expired') },
      terminated: { color: 'default', text: t('leases:leases.terminated') },
      cancelled: { color: 'warning', text: t('leases:leases.cancelled') },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('leases:leases.na');
    // API returns dates in DD-MM-YYYY format, parse accordingly
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  const getUnitInfo = (lease: Lease) => {
    if (!lease.unit) return t('leases:leases.unknownUnit');
    if (lease.unit.unit_name) return lease.unit.unit_name;
    if (lease.unit.unit_number) return `${t('leases:leases.unit')} ${lease.unit.unit_number}`;
    return t('leases:leases.unknownUnit');
  };

  const getTenantName = (lease: Lease) => {
    if (!lease.tenant) return t('leases:leases.unknownTenant');
    if (lease.tenant.first_name && lease.tenant.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return t('leases:leases.unknownTenant');
  };

  const columns: ColumnsType<Lease> = [
    {
      title: t('leases:leases.leaseNumber'),
      dataIndex: 'lease_number',
      key: 'lease_number',
      render: (text: string) => <Text strong>{text || t('leases:leases.na')}</Text>,
      width: 140,
    },
    {
      title: t('leases:leases.property'),
      key: 'property',
      render: (_, record) => (
        <Space vertical size={0}>
          <Text>{record.property?.property_name || t('leases:leases.na')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {getUnitInfo(record)}
          </Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: t('leases:leases.tenant'),
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
      title: t('leases:leases.period'),
      key: 'period',
      render: (_, record) => (
        <Space vertical size={0}>
          <Text style={{ fontSize: '12px' }}>
            <CalendarOutlined /> {formatDate(record.start_date)}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('leases:leases.to')} {formatDate(record.end_date)}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: t('leases:leases.rentAmount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <Text>{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: t('leases:leases.amountPaid'),
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount: number) => <Text type="success">{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: t('leases:leases.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      width: 100,
    },
    {
      title: t('leases:leases.amountRemaining'),
      key: 'amount_remaining',
      fixed: 'right',
      width: 150,
      render: (_, record) => {
        const remaining = record.remaining_amount || 0;
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
              <FileTextOutlined /> {t('leases:leases.title')}
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right', marginTop: window.innerWidth < 576 ? 16 : 0 }}>
            <div ref={addButtonRef}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
                {t('leases:leases.addLease')}
              </Button>
            </div>
          </Col>
        </Row>


        {/* Filters */}
        <Card ref={filtersRef}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={10}>
              <Search
                placeholder={t('leases:leases.searchPlaceholder')}
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Select
                placeholder={t('leases:leases.filterByStatus')}
                allowClear
                style={{ width: '100%' }}
                value={statusFilter || undefined}
                onChange={handleStatusChange}
              >
                <Select.Option value="active">{t('leases:leases.active')}</Select.Option>
                <Select.Option value="expired">{t('leases:leases.expired')}</Select.Option>
                <Select.Option value="terminated">{t('leases:leases.terminated')}</Select.Option>
                <Select.Option value="cancelled">{t('leases:leases.cancelled')}</Select.Option>
                <Select.Option value="draft">{t('leases:leases.draft')}</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ width: '100%' }}>
                {t('leases:leases.refresh')}
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
                showTotal: (total) => t('leases:leases.totalLeases', { count: total }),
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
        title={t('leases:leases.deleteLease')}
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedLease(null);
        }}
        okText={t('leases:leases.delete')}
        cancelText={t('leases:leases.cancel')}
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <p>
          {t('leases:leases.deleteLeaseConfirm', { leaseNumber: selectedLease?.lease_number })}
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
