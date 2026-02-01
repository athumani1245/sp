import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LeaseData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  rent_amount_per_unit: string;
  lease_status: string;
  duration: number;
  remaining_days: number;
  payment_status: string;
}

const LeaseReport: React.FC = () => {
  const navigate = useNavigate();
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
    monthly_rent: true,
    status: true,
    duration: true,
    remaining_days: true,
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

      // Date range filter
      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        
        if (item.start_date) {
          const itemStartDate = dayjs(item.start_date);
          matchesDateRange = itemStartDate.isAfter(startDate) && itemStartDate.isBefore(endDate) || 
                            itemStartDate.isSame(startDate) || itemStartDate.isSame(endDate);
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [leases, filterText, statusFilter, dateRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalLeases = filteredData.length;
    const activeLeases = filteredData.filter((item: LeaseData) => item.lease_status?.toLowerCase() === 'active').length;
    const totalRent = filteredData.reduce((sum: number, item: LeaseData) => {
      const rent = parseFloat(item.rent_amount_per_unit) || 0;
      return sum + rent;
    }, 0);

    return { totalLeases, activeLeases, totalRent };
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
    setDateRange(null);
    message.success('Filters reset');
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'pdf') => {
    const exportData = selectedRowKeys.length > 0 
      ? filteredData.filter((item: LeaseData) => selectedRowKeys.includes(item.lease_number))
      : filteredData;

    if (exportData.length === 0) {
      message.warning('No data available to export');
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
        message.success(`Successfully exported ${exportData.length} records to Excel`);
      } else if (format === 'pdf') {
        exportLeaseReportToPDF({
          data: exportData,
          visibleColumns: visibleColumnKeys,
        });
        message.success(`Successfully exported ${exportData.length} records to PDF`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || `Failed to export data to ${format.toUpperCase()}`);
    }
  };

  // Column definitions
  const allColumns: ColumnsType<LeaseData> = [
    {
      title: 'Lease No.',
      dataIndex: 'lease_number',
      key: 'lease_number',
      sorter: (a, b) => (a.lease_number || '').localeCompare(b.lease_number || ''),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      sorter: (a, b) => (a.tenant || '').localeCompare(b.tenant || ''),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      sorter: (a, b) => (a.property || '').localeCompare(b.property || ''),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      sorter: (a, b) => (a.unit || '').localeCompare(b.unit || ''),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Monthly Rent',
      dataIndex: 'rent_amount_per_unit',
      key: 'monthly_rent',
      sorter: (a, b) => parseFloat(a.rent_amount_per_unit) - parseFloat(b.rent_amount_per_unit),
      render: (rent) => `TSh ${parseFloat(rent || 0).toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'lease_status',
      key: 'status',
      sorter: (a, b) => (a.lease_status || '').localeCompare(b.lease_status || ''),
      render: (status) => {
        const statusLower = (status || 'unknown').toLowerCase();
        let color = 'default';
        
        switch (statusLower) {
          case 'active':
            color = 'success';
            break;
          case 'pending':
            color = 'warning';
            break;
          case 'expired':
            color = 'error';
            break;
          case 'terminated':
            color = 'default';
            break;
          case 'cancelled':
            color = 'default';
            break;
        }
        
        return <Tag color={color}>{statusLower.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Duration (Days)',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (days) => `${days || 0} days`,
    },
    {
      title: 'Remaining Days',
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
        
        return <Tag color={color}>{remaining} days</Tag>;
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
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {} as any))} style={{ marginRight: 8 }}>
            Select All
          </Button>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}>
            Deselect All
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
          <FileTextOutlined /> Lease Agreements Report
        </Title>
        <Text type="secondary">View and export lease agreements data</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Leases"
              value={statistics.totalLeases}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Leases"
              value={statistics.activeLeases}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Monthly Rent"
              value={statistics.totalRent}
              prefix="TSh"
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Export and Refresh Buttons */}
          <Row gutter={[8, 8]}>
            <Col>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
                loading={isLoading}
              >
                Export Excel
              </Button>
            </Col>
            <Col>
              <Button
                danger
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
                loading={isLoading}
              >
                Export PDF
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Refresh
              </Button>
            </Col>
            <Col>
              <Popover content={columnSelector} title="Select Columns" trigger="click">
                <Button icon={<ColumnHeightOutlined />}>
                  Columns
                </Button>
              </Popover>
            </Col>
          </Row>

          {/* Date Range Quick Presets */}
          <Row gutter={[8, 8]}>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>Quick Range:</Text>
              </Space>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('today')}>
                Today
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisWeek')}>
                This Week
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisMonth')}>
                This Month
              </Button>
            </Col>
            <Col>
              <Button size="small" onClick={() => setQuickDateRange('thisYear')}>
                This Year
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Active', value: 'active' },
                  { label: 'Expired', value: 'expired' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search leases..."
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
                Reset Filters
              </Button>
            </Col>
          </Row>

          {/* Active Filters Display */}
          {(filterText || statusFilter || dateRange) && (
            <Space wrap>
              <Text type="secondary">Active Filters:</Text>
              {filterText && <Tag closable onClose={() => setFilterText('')}>Search: {filterText}</Tag>}
              {statusFilter && <Tag closable onClose={() => setStatusFilter('')}>Status: {statusFilter}</Tag>}
              {dateRange && (
                <Tag closable onClose={() => setDateRange(null)}>
                  Date: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
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
            Showing {filteredData.length} of {leases.length} lease agreements
          </Text>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {selectedRowKeys.length} selected
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LeaseReport;
