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
import { usePendingPaymentsReport } from '../hooks/useLeases';
import dayjs, { Dayjs } from 'dayjs';
import { exportPendingPaymentsReportToExcel, exportPendingPaymentsReportToPDF } from '../services/reportService';
import { useTranslation } from 'react-i18next';
import { formatLeaseDate, parseLeaseDate } from '../utils/leaseDate';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface PendingPaymentData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  discount: number;
  lease_status: string;
  payment_status: string;
}

const PendingPaymentsReport: React.FC = () => {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    lease_number: true,
    tenant: true,
    property: true,
    unit: true,
    start_date: true,
    end_date: true,
    amount_due: true,
    amount_paid: true,
    balance: true,
    discount: true,
    lease_status: true,
    payment_status: true,
  });

  const { data: payments = [], isLoading, refetch } = usePendingPaymentsReport();

  const filteredData = useMemo(() => {
    return payments.filter((item: PendingPaymentData) => {
      const searchFields = [
        item.lease_number,
        item.tenant,
        item.property,
        item.unit,
        item.payment_status,
      ].join(' ').toLowerCase();
      const matchesSearch = filterText === '' || searchFields.includes(filterText.toLowerCase());

      const matchesStatus = !statusFilter || item.payment_status?.toLowerCase() === statusFilter.toLowerCase();

      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        if (item.end_date) {
          const itemEndDate = parseLeaseDate(item.end_date);
          matchesDateRange = !!itemEndDate && (
            (itemEndDate.isAfter(startDate) && itemEndDate.isBefore(endDate)) ||
            itemEndDate.isSame(startDate) ||
            itemEndDate.isSame(endDate)
          );
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [payments, filterText, statusFilter, dateRange]);

  const statistics = useMemo(() => {
    const totalRecords = filteredData.length;
    const totalAmountDue = filteredData.reduce((sum: number, item: PendingPaymentData) => sum + (item.balance || 0), 0);
    const unpaidRecords = filteredData.filter((item: PendingPaymentData) => item.payment_status?.toLowerCase() === 'unpaid').length;
    const partialPayments = filteredData.filter((item: PendingPaymentData) => item.payment_status?.toLowerCase().includes('partial')).length;
    return { totalRecords, totalAmountDue, unpaidRecords, partialPayments };
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
    message.success(t('pendingPaymentsReport:filters.filtersReset'));
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    const exportData = selectedRowKeys.length > 0
      ? filteredData.filter((item: PendingPaymentData) => selectedRowKeys.includes(item.lease_number))
      : filteredData;

    if (exportData.length === 0) {
      message.warning(t('pendingPaymentsReport:export.noData'));
      return;
    }

    try {
      const visibleColumnKeys = Object.keys(visibleColumns).filter(
        key => visibleColumns[key as keyof typeof visibleColumns]
      );

      if (format === 'excel') {
        exportPendingPaymentsReportToExcel({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('pendingPaymentsReport:export.successExcel', { count: exportData.length }));
      } else {
        exportPendingPaymentsReportToPDF({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('pendingPaymentsReport:export.successPdf', { count: exportData.length }));
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || t(`pendingPaymentsReport:export.error${format === 'excel' ? 'Excel' : 'Pdf'}`));
    }
  };

  const allColumns: ColumnsType<PendingPaymentData> = [
    {
      title: t('pendingPaymentsReport:columns.leaseNo'),
      dataIndex: 'lease_number',
      key: 'lease_number',
      sorter: (a, b) => (a.lease_number || '').localeCompare(b.lease_number || ''),
      render: (text) => text || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.tenant'),
      dataIndex: 'tenant',
      key: 'tenant',
      sorter: (a, b) => (a.tenant || '').localeCompare(b.tenant || ''),
      render: (text) => text || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.property'),
      dataIndex: 'property',
      key: 'property',
      sorter: (a, b) => (a.property || '').localeCompare(b.property || ''),
      render: (text) => text || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.unit'),
      dataIndex: 'unit',
      key: 'unit',
      sorter: (a, b) => (a.unit || '').localeCompare(b.unit || ''),
      render: (text) => text || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.startDate'),
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => (parseLeaseDate(a.start_date)?.valueOf() || 0) - (parseLeaseDate(b.start_date)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.endDate'),
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => (parseLeaseDate(a.end_date)?.valueOf() || 0) - (parseLeaseDate(b.end_date)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('pendingPaymentsReport:table.na'),
    },
    {
      title: t('pendingPaymentsReport:columns.amountDue'),
      dataIndex: 'amount_due',
      key: 'amount_due',
      sorter: (a, b) => (a.amount_due || 0) - (b.amount_due || 0),
      render: (amount) => <Text style={{ color: '#ff4d4f' }}>TSh {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: t('pendingPaymentsReport:columns.amountPaid'),
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      sorter: (a, b) => (a.amount_paid || 0) - (b.amount_paid || 0),
      render: (amount) => <Text style={{ color: '#52c41a' }}>TSh {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: t('pendingPaymentsReport:columns.balance'),
      dataIndex: 'balance',
      key: 'balance',
      sorter: (a, b) => (a.balance || 0) - (b.balance || 0),
      render: (amount) => (
        <Text style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a' }}>
          TSh {(amount || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: t('pendingPaymentsReport:columns.discount'),
      dataIndex: 'discount',
      key: 'discount',
      sorter: (a, b) => (a.discount || 0) - (b.discount || 0),
      render: (amount) => amount > 0 ? <Text style={{ color: '#1890ff' }}>TSh {(amount || 0).toLocaleString()}</Text> : '-',
    },
    {
      title: t('pendingPaymentsReport:columns.leaseStatus'),
      dataIndex: 'lease_status',
      key: 'lease_status',
      sorter: (a, b) => (a.lease_status || '').localeCompare(b.lease_status || ''),
      render: (status) => {
        const s = (status || '').toLowerCase();
        let color = 'default';
        if (s === 'active') color = 'success';
        else if (s === 'expired') color = 'error';
        else if (s === 'expiring') color = 'warning';
        return <Tag color={color}>{(status || t('pendingPaymentsReport:table.na')).toUpperCase()}</Tag>;
      },
    },
    {
      title: t('pendingPaymentsReport:columns.paymentStatus'),
      dataIndex: 'payment_status',
      key: 'payment_status',
      sorter: (a, b) => (a.payment_status || '').localeCompare(b.payment_status || ''),
      render: (status) => {
        const s = (status || '').toLowerCase();
        let color = 'default';
        if (s === 'unpaid' || s === 'overdue') color = 'error';
        else if (s === 'partial') color = 'warning';
        return <Tag color={color}>{(status || t('pendingPaymentsReport:table.na')).toUpperCase()}</Tag>;
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
            {t('pendingPaymentsReport:columns.selectAll')}
          </Button>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}>
            {t('pendingPaymentsReport:columns.deselectAll')}
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
          <DollarOutlined /> {t('pendingPaymentsReport:title')}
        </Title>
        <Text type="secondary">{t('pendingPaymentsReport:subtitle')}</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('pendingPaymentsReport:statistics.totalRecords')}
              value={statistics.totalRecords}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('pendingPaymentsReport:statistics.totalAmountDue')}
              value={statistics.totalAmountDue}
              prefix="TSh"
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('pendingPaymentsReport:statistics.unpaidRecords')}
              value={statistics.unpaidRecords}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('pendingPaymentsReport:statistics.partialPayments')}
              value={statistics.partialPayments}
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
                {t('pendingPaymentsReport:export.exportExcel')}
              </Button>
            </Col>
            <Col>
              <Button danger icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')} loading={isLoading}>
                {t('pendingPaymentsReport:export.exportPdf')}
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                {t('pendingPaymentsReport:export.refresh')}
              </Button>
            </Col>
            <Col>
              <Popover content={columnSelector} title={t('pendingPaymentsReport:columns.selectColumns')} trigger="click">
                <Button icon={<ColumnHeightOutlined />}>
                  {t('pendingPaymentsReport:export.columns')}
                </Button>
              </Popover>
            </Col>
          </Row>

          <Row gutter={[8, 8]}>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>{t('pendingPaymentsReport:quickRange.label')}</Text>
              </Space>
            </Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('today')}>{t('pendingPaymentsReport:quickRange.today')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisWeek')}>{t('pendingPaymentsReport:quickRange.thisWeek')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisMonth')}>{t('pendingPaymentsReport:quickRange.thisMonth')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisYear')}>{t('pendingPaymentsReport:quickRange.thisYear')}</Button></Col>
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
                placeholder={t('pendingPaymentsReport:filters.paymentStatus')}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { label: t('pendingPaymentsReport:filters.allStatuses'), value: '' },
                  { label: t('pendingPaymentsReport:paymentStatus.unpaid'), value: 'unpaid' },
                  { label: t('pendingPaymentsReport:paymentStatus.partial'), value: 'partial' },
                  { label: t('pendingPaymentsReport:paymentStatus.overdue'), value: 'overdue' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder={t('pendingPaymentsReport:filters.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button icon={<FilterOutlined />} onClick={resetFilters} block>
                {t('pendingPaymentsReport:filters.resetFilters')}
              </Button>
            </Col>
          </Row>

          {(filterText || statusFilter || dateRange) && (
            <Space wrap>
              <Text type="secondary">{t('pendingPaymentsReport:filters.activeFilters')}</Text>
              {filterText && <Tag closable onClose={() => setFilterText('')}>{t('pendingPaymentsReport:filters.search')}: {filterText}</Tag>}
              {statusFilter && <Tag closable onClose={() => setStatusFilter('')}>{t('pendingPaymentsReport:filters.paymentStatus')}: {statusFilter}</Tag>}
              {dateRange && (
                <Tag closable onClose={() => setDateRange(null)}>
                  {t('pendingPaymentsReport:filters.dateRange')}: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
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
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Text type="secondary">
            {t('pendingPaymentsReport:table.showing', { count: filteredData.length, total: payments.length })}
          </Text>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {t('pendingPaymentsReport:table.selected', { count: selectedRowKeys.length })}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PendingPaymentsReport;
