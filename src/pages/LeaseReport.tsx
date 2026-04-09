import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Checkbox,
  Popover,
} from 'antd';
import {
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLeaseReport } from '../hooks/useLeases';
import dayjs, { Dayjs } from 'dayjs';
import { exportLeaseReportToExcel, exportLeaseReportToPDF } from '../services/reportService';
import { useTranslation } from 'react-i18next';
import { formatLeaseDate, parseLeaseDate } from '../utils/leaseDate';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LeaseData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  rent_expected: number;
  amount_paid: number;
  amount_to_be_paid: number;
  overpayment: number;
  remaining_days: number;
  lease_status: string;
  payment_status: string;
}

const LeaseReport: React.FC = () => {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    lease_number: true,
    tenant: true,
    property: true,
    unit: true,
    start_date: true,
    end_date: true,
    rent_expected: true,
    amount_paid: true,
    amount_to_be_paid: true,
    overpayment: true,
    remaining_days: true,
    lease_status: true,
    payment_status: true,
  });

  const { data: leases = [], isLoading, refetch } = useLeaseReport();

  // Filter data based on search, status, and date range
  const filteredData = useMemo(() => {
    return leases.filter((item: LeaseData) => {
      // Search filter
      const searchFields = [
        item.lease_number,
        item.tenant,
        item.property,
        item.unit,
        item.lease_status,
      ].join(' ').toLowerCase();
      const matchesSearch = filterText === '' || searchFields.includes(filterText.toLowerCase());

      // Status filter
      const matchesStatus = !statusFilter || item.lease_status?.toLowerCase() === statusFilter.toLowerCase();

      // Payment status filter
      const matchesPaymentStatus = !paymentStatusFilter || item.payment_status?.toLowerCase() === paymentStatusFilter.toLowerCase();

      // Date range filter
      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        
        if (item.start_date) {
          const itemStartDate = parseLeaseDate(item.start_date);
          matchesDateRange = !!itemStartDate && (
            (itemStartDate.isAfter(startDate) && itemStartDate.isBefore(endDate)) ||
            itemStartDate.isSame(startDate) ||
            itemStartDate.isSame(endDate)
          );
        }
      }

      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
    });
  }, [leases, filterText, statusFilter, paymentStatusFilter, dateRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalLeases = filteredData.length;
    const activeLeases = filteredData.filter((item: LeaseData) => item.lease_status?.toLowerCase() === 'active').length;
    const totalRentExpected = filteredData.reduce((sum: number, item: LeaseData) => {
      return sum + (item.rent_expected || 0);
    }, 0);
    const totalAmountPaid = filteredData.reduce((sum: number, item: LeaseData) => {
      return sum + (item.amount_paid || 0);
    }, 0);
    const totalAmountDue = filteredData.reduce((sum: number, item: LeaseData) => {
      return sum + (item.amount_to_be_paid || 0);
    }, 0);

    return { totalLeases, activeLeases, totalRentExpected, totalAmountPaid, totalAmountDue };
  }, [filteredData]);

  // Quick date range presets
  const setQuickDateRange = (preset: string) => {
    const today = dayjs();
    let start: Dayjs;
    let end: Dayjs;

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'thisWeek':
        start = today.startOf('week');
        end = today.endOf('week');
        break;
      case 'thisMonth':
        start = today.startOf('month');
        end = today.endOf('month');
        break;
      case 'thisYear':
        start = today.startOf('year');
        end = today.endOf('year');
        break;
      default:
        return;
    }

    setDateRange([start, end]);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterText('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateRange(null);
    message.success(t('leaseReport:filters.filtersReset'));
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'pdf') => {
    const exportData = selectedRowKeys.length > 0 
      ? filteredData.filter((item: LeaseData) => selectedRowKeys.includes(item.lease_number))
      : filteredData;

    if (exportData.length === 0) {
      message.warning(t('leaseReport:export.noData'));
      return;
    }

    try {
      // Get visible column keys
      const visibleColumnKeys = Object.keys(visibleColumns).filter(
        key => visibleColumns[key as keyof typeof visibleColumns]
      );

      if (format === 'excel') {
        exportLeaseReportToExcel({
          data: exportData,
          visibleColumns: visibleColumnKeys,
        });
        message.success(t('leaseReport:export.successExcel', { count: exportData.length }));
      } else if (format === 'pdf') {
        exportLeaseReportToPDF({
          data: exportData,
          visibleColumns: visibleColumnKeys,
        });
        message.success(t('leaseReport:export.successPdf', { count: exportData.length }));
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || t(`leaseReport:export.error${format === 'excel' ? 'Excel' : 'Pdf'}`));
    }
  };

  // Column definitions
  const allColumns: ColumnsType<LeaseData> = [
    {
      title: t('leaseReport:columns.leaseNo'),
      dataIndex: 'lease_number',
      key: 'lease_number',
      sorter: (a, b) => (a.lease_number || '').localeCompare(b.lease_number || ''),
      render: (text) => text || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.tenant'),
      dataIndex: 'tenant',
      key: 'tenant',
      sorter: (a, b) => (a.tenant || '').localeCompare(b.tenant || ''),
      render: (text) => text || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.property'),
      dataIndex: 'property',
      key: 'property',
      sorter: (a, b) => (a.property || '').localeCompare(b.property || ''),
      render: (text) => text || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.unit'),
      dataIndex: 'unit',
      key: 'unit',
      sorter: (a, b) => (a.unit || '').localeCompare(b.unit || ''),
      render: (text) => text || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.startDate'),
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => (parseLeaseDate(a.start_date)?.valueOf() || 0) - (parseLeaseDate(b.start_date)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.endDate'),
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => (parseLeaseDate(a.end_date)?.valueOf() || 0) - (parseLeaseDate(b.end_date)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('leaseReport:table.na'),
    },
    {
      title: t('leaseReport:columns.rentExpected'),
      dataIndex: 'rent_expected',
      key: 'rent_expected',
      sorter: (a, b) => (a.rent_expected || 0) - (b.rent_expected || 0),
      render: (rent) => `TSh ${(rent || 0).toLocaleString()}`,
    },
    {
      title: t('leaseReport:columns.amountPaid'),
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      sorter: (a, b) => (a.amount_paid || 0) - (b.amount_paid || 0),
      render: (amount) => <Text style={{ color: '#52c41a' }}>TSh {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: t('leaseReport:columns.amountDue'),
      dataIndex: 'amount_to_be_paid',
      key: 'amount_to_be_paid',
      sorter: (a, b) => (a.amount_to_be_paid || 0) - (b.amount_to_be_paid || 0),
      render: (amount) => <Text style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a' }}>TSh {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: t('leaseReport:columns.overpayment'),
      dataIndex: 'overpayment',
      key: 'overpayment',
      sorter: (a, b) => (a.overpayment || 0) - (b.overpayment || 0),
      render: (amount) => amount > 0 ? <Text style={{ color: '#1890ff' }}>TSh {amount.toLocaleString()}</Text> : '-',
    },
    {
      title: t('leaseReport:columns.leaseStatus'),
      dataIndex: 'lease_status',
      key: 'lease_status',
      sorter: (a, b) => (a.lease_status || '').localeCompare(b.lease_status || ''),
      render: (status) => {
        const statusLower = (status || 'unknown').toLowerCase();
        let color = 'default';
        
        switch (statusLower) {
          case 'active':
            color = 'success';
            break;
          case 'draft':
            color = 'default';
            break;
          case 'expired':
            color = 'error';
            break;
          case 'terminated':
            color = 'default';
            break;
          case 'cancelled':
            color = 'warning';
            break;
        }
        
        return <Tag color={color}>{statusLower.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('leaseReport:columns.paymentStatus'),
      dataIndex: 'payment_status',
      key: 'payment_status',
      sorter: (a, b) => (a.payment_status || '').localeCompare(b.payment_status || ''),
      render: (status) => {
        let color = 'default';
        const statusLower = (status || '').toLowerCase();
        
        switch (statusLower) {
          case 'paid':
            color = 'success';
            break;
          case 'partial':
            color = 'warning';
            break;
          case 'unpaid':
            color = 'error';
            break;
          case 'overpaid':
            color = 'processing';
            break;
        }
        
        return <Tag color={color}>{status || t('leaseReport:table.na')}</Tag>;
      },
    },
    {
      title: t('leaseReport:columns.remainingDays'),
      dataIndex: 'remaining_days',
      key: 'remaining_days',
      sorter: (a, b) => (a.remaining_days || 0) - (b.remaining_days || 0),
      render: (days) => {
        const remaining = days || 0;
        let color = 'success';
        
        if (remaining <= 0) {
          color = 'error';
        } else if (remaining <= 30) {
          color = 'warning';
        } else if (remaining <= 90) {
          color = 'processing';
        }
        
        return <Tag color={color}>{t('leaseReport:table.days', { count: remaining })}</Tag>;
      },
    },
  ];

  // Filter visible columns
  const visibleColumnsArray = allColumns.filter(col => 
    visibleColumns[col.key as keyof typeof visibleColumns]
  );

  // Column selector
  const columnSelector = (
    <div style={{ padding: '8px' }}>
      <Space vertical style={{ width: '100%' }}>
        <div>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {} as any))} style={{ marginRight: 8 }}>
            {t('leaseReport:columns.selectAll')}
          </Button>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}>
            {t('leaseReport:columns.deselectAll')}
          </Button>
        </div>
        {Object.keys(visibleColumns).map(key => (
          <Checkbox
            key={key}
            checked={visibleColumns[key as keyof typeof visibleColumns]}
            onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
          >
            {String(allColumns.find(col => col.key === key)?.title || key)}
          </Checkbox>
        ))}
      </Space>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined /> {t('leaseReport:title')}
        </Title>
        <Text type="secondary">{t('leaseReport:subtitle')}</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.totalLeases')}
              value={statistics.totalLeases}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.activeLeases')}
              value={statistics.activeLeases}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.expectedRent')}
              value={statistics.totalRentExpected}
              prefix="TSh"
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.totalPaid')}
              value={statistics.totalAmountPaid}
              prefix="TSh"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.totalAmountDue')}
              value={statistics.totalAmountDue}
              prefix="TSh"
              precision={0}
              valueStyle={{ color: statistics.totalAmountDue > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title={t('leaseReport:statistics.collectionRate')}
              value={statistics.totalRentExpected > 0 ? (statistics.totalAmountPaid / statistics.totalRentExpected * 100) : 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space vertical size="middle" style={{ width: '100%' }}>
          {/* Export and Refresh Buttons */}
          <Row gutter={[8, 8]}>
            <Col>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
                loading={isLoading}
              >
                {t('leaseReport:export.exportExcel')}
              </Button>
            </Col>
            <Col>
              <Button
                danger
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
                loading={isLoading}
              >
                {t('leaseReport:export.exportPdf')}
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                {t('leaseReport:export.refresh')}
              </Button>
            </Col>
            <Col>
              <Popover content={columnSelector} title={t('leaseReport:columns.selectColumns')} trigger="click">
                <Button icon={<ColumnHeightOutlined />}>
                  {t('leaseReport:export.columns')}
                </Button>
              </Popover>
            </Col>
          </Row>

          {/* Date Range Quick Presets */}
          <Row gutter={[8, 8]}>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>{t('leaseReport:quickRange.label')}</Text>
              </Space>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('today')}>
                {t('leaseReport:quickRange.today')}
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisWeek')}>
                {t('leaseReport:quickRange.thisWeek')}
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisMonth')}>
                {t('leaseReport:quickRange.thisMonth')}
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisYear')}>
                {t('leaseReport:quickRange.thisYear')}
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={5}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder={t('leaseReport:filters.leaseStatus')}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { label: t('leaseReport:filters.allStatuses'), value: '' },
                  { label: t('leaseReport:status.active'), value: 'active' },
                  { label: t('leaseReport:status.draft'), value: 'draft' },
                  { label: t('leaseReport:status.expired'), value: 'expired' },
                  { label: t('leaseReport:status.cancelled'), value: 'cancelled' },
                  { label: t('leaseReport:status.terminated'), value: 'terminated' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder={t('leaseReport:filters.paymentStatus')}
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                allowClear
                options={[
                  { label: t('leaseReport:filters.all'), value: '' },
                  { label: t('leaseReport:paymentStatus.paid'), value: 'paid' },
                  { label: t('leaseReport:paymentStatus.partial'), value: 'partial' },
                  { label: t('leaseReport:paymentStatus.unpaid'), value: 'unpaid' },
                  { label: t('leaseReport:paymentStatus.overpaid'), value: 'overpaid' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={7}>
              <Input
                placeholder={t('leaseReport:filters.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<FilterOutlined />}
                onClick={resetFilters}
                block
              >
                {t('leaseReport:filters.resetFilters')}
              </Button>
            </Col>
          </Row>

          {/* Active Filters Display */}
          {(filterText || statusFilter || paymentStatusFilter || dateRange) && (
            <Space wrap>
              <Text type="secondary">{t('leaseReport:filters.activeFilters')}</Text>
              {filterText && <Tag closable onClose={() => setFilterText('')}>{t('leaseReport:filters.search')}: {filterText}</Tag>}
              {statusFilter && <Tag closable onClose={() => setStatusFilter('')}>{t('leaseReport:filters.leaseStatus')}: {statusFilter}</Tag>}
              {paymentStatusFilter && <Tag closable onClose={() => setPaymentStatusFilter('')}>{t('leaseReport:filters.paymentStatus')}: {paymentStatusFilter}</Tag>}
              {dateRange && (
                <Tag closable onClose={() => setDateRange(null)}>
                  {t('leaseReport:filters.dateRange')}: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
                </Tag>
              )}
            </Space>
          )}
        </Space>
      </Card>

      {/* Data Table */}
      <Card>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={visibleColumnsArray}
          dataSource={filteredData}
          rowKey="lease_number"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 'max-content' }}
          size="small"
        />

        {/* Footer Info */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Text type="secondary">
            {t('leaseReport:table.showing', { count: filteredData.length, total: leases.length })}
          </Text>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {t('leaseReport:table.selected', { count: selectedRowKeys.length })}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LeaseReport;
