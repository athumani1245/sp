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
  TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExpenseReport } from '../hooks/useExpenses';
import dayjs, { Dayjs } from 'dayjs';
import { exportExpenseReportToExcel, exportExpenseReportToPDF } from '../services/reportService';
import { useTranslation } from 'react-i18next';
import { formatLeaseDate, parseLeaseDate } from '../utils/leaseDate';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ExpenseReportData {
  id: string;
  date: string;
  property: string;
  unit: string;
  category: string;
  description: string;
  amount: number;
}

const ExpenseReport: React.FC = () => {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    property: true,
    unit: true,
    category: true,
    description: true,
    amount: true,
  });

  const { data: expenses = [], isLoading, refetch } = useExpenseReport();

  const filteredData = useMemo(() => {
    return expenses.filter((item: ExpenseReportData) => {
      const searchFields = [
        item.property,
        item.unit,
        item.category,
        item.description,
      ].join(' ').toLowerCase();
      const matchesSearch = filterText === '' || searchFields.includes(filterText.toLowerCase());

      const matchesCategory = !categoryFilter || (item.category || '') === categoryFilter;

      let matchesDateRange = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        const itemDate = parseLeaseDate(item.date);
        matchesDateRange = !!itemDate && !itemDate.isBefore(startDate) && !itemDate.isAfter(endDate);
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [expenses, filterText, categoryFilter, dateRange]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(expenses.map((item: ExpenseReportData) => item.category).filter(Boolean))).sort() as string[],
    [expenses]
  );

  const statistics = useMemo(() => {
    const totalRecords = filteredData.length;
    const totalAmount = filteredData.reduce((sum: number, item: ExpenseReportData) => sum + (item.amount || 0), 0);
    const averageAmount = totalRecords ? totalAmount / totalRecords : 0;
    const categoriesCount = new Set(filteredData.map((item: ExpenseReportData) => item.category).filter(Boolean)).size;
    return { totalRecords, totalAmount, averageAmount, categoriesCount };
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
    setCategoryFilter('');
    setDateRange(null);
    message.success(t('expenseReport:filters.filtersReset'));
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    const exportData = selectedRowKeys.length > 0
      ? filteredData.filter((item: ExpenseReportData) => selectedRowKeys.includes(item.id))
      : filteredData;

    if (exportData.length === 0) {
      message.warning(t('expenseReport:export.noData'));
      return;
    }

    try {
      const visibleColumnKeys = Object.keys(visibleColumns).filter(
        key => visibleColumns[key as keyof typeof visibleColumns]
      );

      if (format === 'excel') {
        exportExpenseReportToExcel({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('expenseReport:export.successExcel', { count: exportData.length }));
      } else {
        exportExpenseReportToPDF({ data: exportData, visibleColumns: visibleColumnKeys });
        message.success(t('expenseReport:export.successPdf', { count: exportData.length }));
      }
    } catch (error: any) {
      console.error('Export error:', error);
      message.error(error.message || t(`expenseReport:export.error${format === 'excel' ? 'Excel' : 'Pdf'}`));
    }
  };

  const allColumns: ColumnsType<ExpenseReportData> = [
    {
      title: t('expenseReport:columns.date'),
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => (parseLeaseDate(a.date)?.valueOf() || 0) - (parseLeaseDate(b.date)?.valueOf() || 0),
      render: (date) => formatLeaseDate(date) || t('expenseReport:table.na'),
    },
    {
      title: t('expenseReport:columns.property'),
      dataIndex: 'property',
      key: 'property',
      sorter: (a, b) => (a.property || '').localeCompare(b.property || ''),
      render: (text) => text || t('expenseReport:table.na'),
    },
    {
      title: t('expenseReport:columns.unit'),
      dataIndex: 'unit',
      key: 'unit',
      sorter: (a, b) => (a.unit || '').localeCompare(b.unit || ''),
      render: (text) => text || <Text type="secondary">{t('expenseReport:table.wholeProperty')}</Text>,
    },
    {
      title: t('expenseReport:columns.category'),
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
      render: (category) => <Tag>{category || t('expenseReport:table.uncategorized')}</Tag>,
    },
    {
      title: t('expenseReport:columns.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || <Text type="secondary">-</Text>,
    },
    {
      title: t('expenseReport:columns.amount'),
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (amount) => <Text strong style={{ color: '#ff4d4f' }}>TSh {(amount || 0).toLocaleString()}</Text>,
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
            {t('expenseReport:columns.selectAll')}
          </Button>
          <Button size="small" onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}>
            {t('expenseReport:columns.deselectAll')}
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
          <DollarOutlined /> {t('expenseReport:title')}
        </Title>
        <Text type="secondary">{t('expenseReport:subtitle')}</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('expenseReport:statistics.totalRecords')}
              value={statistics.totalRecords}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('expenseReport:statistics.totalAmount')}
              value={statistics.totalAmount}
              prefix="TSh"
              precision={0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('expenseReport:statistics.averageAmount')}
              value={statistics.averageAmount}
              prefix="TSh"
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('expenseReport:statistics.categories')}
              value={statistics.categoriesCount}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space vertical size="middle" style={{ width: '100%' }}>
          <Row gutter={[8, 8]}>
            <Col>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={() => handleExport('excel')} loading={isLoading}>
                {t('expenseReport:export.exportExcel')}
              </Button>
            </Col>
            <Col>
              <Button danger icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')} loading={isLoading}>
                {t('expenseReport:export.exportPdf')}
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                {t('expenseReport:export.refresh')}
              </Button>
            </Col>
            <Col>
              <Popover content={columnSelector} title={t('expenseReport:columns.selectColumns')} trigger="click">
                <Button icon={<ColumnHeightOutlined />}>
                  {t('expenseReport:export.columns')}
                </Button>
              </Popover>
            </Col>
          </Row>

          <Row gutter={[8, 8]}>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>{t('expenseReport:quickRange.label')}</Text>
              </Space>
            </Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('today')}>{t('expenseReport:quickRange.today')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisWeek')}>{t('expenseReport:quickRange.thisWeek')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisMonth')}>{t('expenseReport:quickRange.thisMonth')}</Button></Col>
            <Col><Button size="small" onClick={() => setQuickDateRange('thisYear')}>{t('expenseReport:quickRange.thisYear')}</Button></Col>
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
                placeholder={t('expenseReport:filters.category')}
                value={categoryFilter}
                onChange={setCategoryFilter}
                allowClear
                options={[
                  { label: t('expenseReport:filters.allCategories'), value: '' },
                  ...categoryOptions.map((c) => ({ label: c, value: c })),
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder={t('expenseReport:filters.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button icon={<FilterOutlined />} onClick={resetFilters} block>
                {t('expenseReport:filters.resetFilters')}
              </Button>
            </Col>
          </Row>

          {(filterText || categoryFilter || dateRange) && (
            <Space wrap>
              <Text type="secondary">{t('expenseReport:filters.activeFilters')}</Text>
              {filterText && <Tag closable onClose={() => setFilterText('')}>{t('expenseReport:filters.search')}: {filterText}</Tag>}
              {categoryFilter && <Tag closable onClose={() => setCategoryFilter('')}>{t('expenseReport:filters.category')}: {categoryFilter}</Tag>}
              {dateRange && (
                <Tag closable onClose={() => setDateRange(null)}>
                  {t('expenseReport:filters.dateRange')}: {dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}
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
            {t('expenseReport:table.showing', { count: filteredData.length, total: expenses.length })}
          </Text>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">
              {t('expenseReport:table.selected', { count: selectedRowKeys.length })}
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpenseReport;
