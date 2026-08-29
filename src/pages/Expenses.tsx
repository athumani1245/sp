import React, { useState } from 'react';
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
  Typography,
  Select,
  Grid,
  Divider,
  Empty,
  Modal,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  WalletOutlined,
  DeleteOutlined,
  CalendarOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import AddExpenseModal from '../components/forms/AddExpenseModal';
import ManageCategoriesModal from '../components/forms/ManageCategoriesModal';
import { useExpenses, useDeleteExpense } from '../hooks/useExpenses';
import { useExpenseCategories } from '../hooks/useExpenseCategories';
import dayjs from 'dayjs';

const { Search } = Input;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

interface Expense {
  id: string;
  properties: string[];
  units: string[];
  amount: string | number;
  category: string | null;
  description?: string;
  date: string;
}

const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const { data, isLoading } = useExpenses();
  const expenses: Expense[] = data || [];
  const deleteExpenseMutation = useDeleteExpense();

  const { data: categories } = useExpenseCategories();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);

  const formatCurrency = (amount: string | number) => {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numeric && numeric !== 0) return 'TSh 0';
    return `TSh ${numeric.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('expenses:expenses.na');
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      expense.properties.join(' ').toLowerCase().includes(searchLower) ||
      expense.units.join(' ').toLowerCase().includes(searchLower) ||
      (expense.category || '').toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const handleExpenseAdded = () => {
    setShowAddModal(false);
  };

  const handleDelete = (expense: Expense) => {
    confirm({
      title: t('expenses:expenses.deleteExpense'),
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: t('expenses:expenses.deleteExpenseConfirm', { amount: formatCurrency(expense.amount) }),
      okText: t('expenses:expenses.delete'),
      okType: 'danger',
      cancelText: t('expenses:expenses.cancel'),
      onOk: async () => {
        try {
          await deleteExpenseMutation.mutateAsync(expense.id);
        } catch (error) {
          // Error already handled by the mutation
        }
      },
    });
  };

  const columns: ColumnsType<Expense> = [
    {
      title: t('expenses:expenses.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
      width: 160,
    },
    {
      title: t('expenses:expenses.property'),
      dataIndex: 'properties',
      key: 'properties',
      render: (properties: string[]) =>
        properties && properties.length > 0 ? (
          <Space wrap size={[4, 4]}>
            {properties.map((name, idx) => (
              <Tag key={idx}>{name}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">{t('expenses:expenses.na')}</Text>
        ),
    },
    {
      title: t('expenses:expenses.unit'),
      dataIndex: 'units',
      key: 'units',
      render: (units: string[]) =>
        units && units.length > 0 ? (
          <Space wrap size={[4, 4]}>
            {units.map((name, idx) => (
              <Tag key={idx}>{name}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">{t('expenses:expenses.wholeProperty')}</Text>
        ),
    },
    {
      title: t('expenses:expenses.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string | null) => (
        <Tag>{category || t('expenses:expenses.uncategorized')}</Tag>
      ),
    },
    {
      title: t('expenses:expenses.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string | number) => <Text strong>{formatCurrency(amount)}</Text>,
    },
    {
      title: t('expenses:expenses.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description || <Text type="secondary">-</Text>,
    },
    {
      title: t('expenses:expenses.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          {t('expenses:expenses.delete')}
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space vertical size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0 }}>
              <WalletOutlined /> {t('expenses:expenses.title')}
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<TagsOutlined />} onClick={() => setShowManageCategoriesModal(true)}>
                {t('expenses:manageCategories.button')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
                {t('expenses:expenses.addExpense')}
              </Button>
            </Space>
          </Col>
        </Row>
        <Text type="secondary">{t('expenses:expenses.subtitle')}</Text>

        {/* Expenses */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={10}>
              <Search
                placeholder={t('expenses:expenses.searchPlaceholder')}
                allowClear
                onSearch={setSearch}
                onChange={(e) => e.target.value === '' && setSearch('')}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('expenses:expenses.filterByCategory')}
                allowClear
                style={{ width: '100%' }}
                value={categoryFilter || undefined}
                onChange={(value) => setCategoryFilter(value || '')}
                options={(categories || []).map((c) => ({ value: c.name, label: c.name }))}
              />
            </Col>
          </Row>
          <Divider style={{ marginBlock: 16 }} />
          {isLoading ? (
            <div>
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ) : screens.md ? (
            <Table<Expense>
              columns={columns}
              dataSource={filteredExpenses}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => t('expenses:expenses.totalExpenses', { count: total }),
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <>
                        <Text strong>{t('expenses:expenses.emptyTitle')}</Text>
                        <br />
                        <Text type="secondary">{t('expenses:expenses.emptyDescription')}</Text>
                      </>
                    }
                  />
                ),
              }}
            />
          ) : (
            <Table<Expense>
              columns={columns.filter((c) => c.key !== 'units' && c.key !== 'description')}
              dataSource={filteredExpenses}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 700 }}
              size="small"
            />
          )}
        </Card>
      </Space>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
      />
    </div>
  );
};

export default Expenses;
