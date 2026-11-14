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
  DollarOutlined,
  FilterOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePaymentsReport } from '../hooks/useLeases';
import dayjs, { Dayjs } from 'dayjs';
import { exportPaymentsReportToExcel, exportPaymentsReportToPDF } from '../services/reportService';
import { useTranslation } from 'react-i18next';
import { formatLeaseDate, parseLeaseDate } from '../utils/leaseDate';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface PaymentReportData {
  id: string;
  date_paid: string;
  lease_number: string;
  tenant: string;
  amount_paid: number;
  payment_source: string;
  category: string;
  status: string;
}

// Backend uses several spellings (e.g. "success"/"paid", "refund"/"refunded")
const normalizeStatus = (status?: string): string => {
  const s = (status || '').toLowerCase();
  if (s === 'paid' || s === 'success') return 'paid';
  if (s.includes('refund')) return 'refunded';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return s;
};

const PaymentsReport: React.FC = () => {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    date_paid: true,
    lease_number: true,
    tenant: true,
    amount_paid: true,
    payment_source: true,
    category: true,
    status: true,
  });

  const { data: payments = [], isLoading, refetch } = usePaymentsReport();

  const filteredData = useMemo(() => {
    return payments.filter((item: PaymentReportData) => {
      const searchFields = [
        item.lease_number,
        item.tenant,
        item.payment_source,
        item.category,
      ].join(' ').toLowerCase();
      const matchesSearch = filterText === '' || searchFields.includes(filterText.toLowerCase());

      const matchesStatus = !statusFilter || normalizeStatus(item.status) === statusFilter;

      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        const itemDate = parseLeaseDate(item.date_paid);
        matchesDateRange = !!itemDate && !itemDate.isBefore(startDate) && !itemDate.isAfter(endDate);
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [payments, filterText, statusFilter, dateRange]);

  const statistics = useMemo(() => {
    const totalRecords = filteredData.length;
    const paidRecords = filteredData.filter((item: PaymentReportData) => normalizeStatus(item.status) === 'paid');
    const totalCollected = paidRecords.reduce((sum: number, item: PaymentReportData) => sum + (item.amount_paid || 0), 0);
    const successfulPayments = paidRecords.length;
    const refundedOrCancelled = filteredData.filter((item: PaymentReportData) =>
      ['refunded', 'cancelled'].includes(normalizeStatus(item.status))
    ).length;
    return { totalRecords, totalCollected, successfulPayments, refundedOrCancelled };
  }, [filteredData]);

  const setQuickDateRange = (preset: string) => {
    const today = dayjs();
    let start: Dayjs;
    let end: Dayjs;
    switch (preset) {
      case 'today': start = today; end = today; break;
      case 'thisWeek': start = today.startOf('week'); end = today.endOf('week'); break;
      case 'thisMonth': start = today.startOf('month'); end = today.endOf('month'); break;
      case 'thisYear': start = today.startOf('year'); end = today.endOf('year'); break;
      default: return;
    }
    setDateRange([start, end]);
  };

  const resetFilters = () => {
    setFilterText('');
    setStatusFilter('');
    setDateRange(null);
    message.success(t('paymentsReport:filters.filtersReset'));
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    const exportData = selectedRowKeys.length > 0
      ? filteredData.filter((item: PaymentReportData) => selectedRowKeys.includes(item.id))
      : filteredData;

    if (exportData.length === 0) {
      message.warning(t('paymentsReport:export.noData'));
      return;
    }

    try {
      const visibleColumnKeys = Object.keys(visibleColumns).filter(
        key => visibleColumns[key as keyof typeof visibleColumns]
      );

      if (format === 'excel') {
        exportPaymentsReportToExcel({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('paymentsReport:export.successExcel', { count: exportData.length }));
      } else {
        exportPaymentsReportToPDF({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('paymentsReport:export.successPdf', { count: exportData.length }));
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || t(`paymentsReport:export.error${format === 'excel' ? 'Excel' : 'Pdf'}`));
    }
  };

  const allColumns: ColumnsType<PaymentReportData> = [
    {
      title: t('paymentsReport:columns.datePaid'),
      dataIndex: 'date_paid',
      key: 'date_paid',
      defaultSortOrder: 'descend',
      sorter: (a, b) => (parseLeaseDate(a.date_paid)?.valueOf() || 0) - (parseLeaseDate(b.date_paid)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('paymentsReport:table.na'),
    },
    {
      title: t('paymentsReport:columns.leaseNo'),
      dataIndex: 'lease_number',
      key: 'lease_number',
      sorter: (a, b) => (a.lease_number || '').localeCompare(b.lease_number || ''),
      render: (text) => text || t('paymentsReport:table.na'),
    },
    {
      title: t('paymentsReport:columns.tenant'),
      dataIndex: 'tenant',
      key: 'tenant',
      sorter: (a, b) => (a.tenant || '').localeCompare(b.tenant || ''),
      render: (text) => text || t('paymentsReport:table.na'),
    },
    {
      title: t('paymentsReport:columns.amountPaid'),
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      sorter: (a, b) => (a.amount_paid || 0) - (b.amount_paid || 0),
      render: (amount) => <Text style={{ color: '#52c41a' }}>TSh {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: t('paymentsReport:columns.paymentSource'),
      dataIndex: 'payment_source',
      key: 'payment_source',
      sorter: (a, b) => (a.payment_source || '').localeCompare(b.payment_source || ''),
      render: (source) => (source || t('paymentsReport:table.na')).toUpperCase(),
    },
    {
      title: t('paymentsReport:columns.category'),
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
      render: (category) => (category || t('paymentsReport:table.na')).toUpperCase(),
    },
    {
      title: t('paymentsReport:columns.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      render: (status) => {
        const s = normalizeStatus(status);
        let color = 'default';
        if (s === 'paid') color = 'success';
        else if (s === 'refunded') color = 'warning';
        else if (s === 'cancelled') color = 'error';
        return <Tag color={color}>{(status || t('paymentsReport:table.na')).toUpperCase()}</Tag>;
      },
    },
  ];

  const visibleColumnsArray = allColumns.filter(col =>
    visibleColumns[col.key as keyof typeof visibleColumns]
  );

  const columnSelector = (
    <div style={{ padding: '8px' }}>
      <Space vertical style={{ width: '100%' }}>
        <div>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {} as any))} style={{ marginRight: 8 }}>
            {t('paymentsReport:columns.selectAll')}
          </Button>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}>
            {t('paymentsReport:columns.deselectAll')}
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
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DollarOutlined /> {t('paymentsReport:title')}
        </Title>
        <Text type="secondary">{t('paymentsReport:subtitle')}</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('paymentsReport:statistics.totalRecords')}
              value={statistics.totalRecords}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('paymentsReport:statistics.totalCollected')}
              value={statistics.totalCollected}
              prefix="TSh"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('paymentsReport:statistics.successfulPayments')}
              value={statistics.successfulPayments}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('paymentsReport:statistics.refundedOrCancelled')}
              value={statistics.refundedOrCancelled}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space vertical size="middle" style={{ width: '100%' }}>
          <Row gutter={[8, 8]}>
            <Col>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={() => handleExport('excel')} loading={isLoading}>
                {t('paymentsReport:export.exportExcel')}
              </Button>
            </Col>
            <Col>
              <Button danger icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')} loading={isLoading}>
                {t('paymentsReport:export.exportPdf')}
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                {t('paymentsReport:export.refresh')}
              </Button>
            </Col>
            <Col>
              <Popover content={columnSelector} title={t('paymentsReport:columns.selectColumns')} trigger="click">
                <Button icon={<ColumnHeightOutlined />}>
                  {t('paymentsReport:export.columns')}
                </Button>
              </Popover>
            </Col>
          </Row>

          <Row gutter={[8, 8]}>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>{t('paymentsReport:quickRange.label')}</Text>
              </Space>
            </Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('today')}>{t('paymentsReport:quickRange.today')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisWeek')}>{t('paymentsReport:quickRange.thisWeek')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisMonth')}>{t('paymentsReport:quickRange.thisMonth')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisYear')}>{t('paymentsReport:quickRange.thisYear')}</Button></Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={5}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                style={{ width: '100%' }}
                placeholder={t('paymentsReport:filters.paymentStatus')}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { label: t('paymentsReport:filters.allStatuses'), value: '' },
                  { label: t('paymentsReport:paymentStatus.paid'), value: 'paid' },
                  { label: t('paymentsReport:paymentStatus.refunded'), value: 'refunded' },
                  { label: t('paymentsReport:paymentStatus.cancelled'), value: 'cancelled' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder={t('paymentsReport:filters.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button icon={<FilterOutlined />} onClick={resetFilters} block>
                {t('paymentsReport:filters.resetFilters')}
              </Button>
            </Col>
          </Row>

          {(filterText || statusFilter || dateRange) && (
            <Space wrap>
              <Text type="secondary">{t('paymentsReport:filters.activeFilters')}</Text>
              {filterText && <Tag closable onClose={() => setFilterText('')}>{t('paymentsReport:filters.search')}: {filterText}</Tag>}
              {statusFilter && <Tag closable onClose={() => setStatusFilter('')}>{t('paymentsReport:filters.paymentStatus')}: {statusFilter}</Tag>}
              {dateRange && (
                <Tag closable onClose={() => setDateRange(null)}>
                  {t('paymentsReport:filters.dateRange')}: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
                </Tag>
              )}
            </Space>
          )}
        </Space>
      </Card>

      <Card>
        <Table
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          columns={visibleColumnsArray}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 'max-content' }}
          size="small"
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Text type="secondary">
            {t('paymentsReport:table.showing', { count: filteredData.length, total: payments.length })}
          </Text>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {t('paymentsReport:table.selected', { count: selectedRowKeys.length })}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentsReport;
