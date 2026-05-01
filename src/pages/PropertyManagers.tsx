import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  IdcardOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import AddPropertyManagerModal from '../components/forms/AddPropertyManagerModal';
import PropertyManagerDetailModal from '../components/forms/PropertyManagerDetailModal';
import MobilePropertyManagersList from '../components/mobile/MobilePropertyManagersList';
import { usePropertyManagers, useDeletePropertyManager } from '../hooks/usePropertyManagers';
import { useTour } from '../hooks/useTour';

const { Search } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { useBreakpoint } = Grid;

interface PropertyManager {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
}

const PropertyManagers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();
  const { open: tourOpen, setOpen: setTourOpen, markTourCompleted } = useTour('propertyManagers');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Tour refs
  const addButtonRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  // Tour steps configuration
  const tourSteps: TourProps['steps'] = [
    {
      title: t('propertyManagers:propertyManagers.tourWelcomeTitle'),
      description: t('propertyManagers:propertyManagers.tourWelcomeDesc'),
    },
    {
      title: t('propertyManagers:propertyManagers.tourAddTitle'),
      description: t('propertyManagers:propertyManagers.tourAddDesc'),
      target: () => addButtonRef.current,
    },
    {
      title: t('propertyManagers:propertyManagers.tourSearchTitle'),
      description: t('propertyManagers:propertyManagers.tourSearchDesc'),
      target: () => searchRef.current,
    },
    {
      title: t('propertyManagers:propertyManagers.tourTableTitle'),
      description: t('propertyManagers:propertyManagers.tourTableDesc'),
      target: () => tableRef.current,
    },
  ];

  // Use TanStack Query hook
  const { data, isLoading, error } = usePropertyManagers({
    search,
    page,
    limit: 10,
  });

  const deleteManagerMutation = useDeletePropertyManager();

  // Ensure managers is always an array
  const managers = Array.isArray(data?.items) ? data?.items : [];
  const totalCount = data?.pagination?.total || 0;

  // Handle error state
  if (error) {
    console.error('Property managers fetch error:', error);
    messageApi.error(t('propertyManagers:propertyManagers.loadFailed'));
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPage(newPagination.current || 1);
  };

  const handleViewManager = (managerId: string) => {
    setSelectedManagerId(managerId);
    setShowDetailModal(true);
  };

  const handleDelete = (managerId: string, managerName: string) => {
    confirm({
      title: t('propertyManagers:propertyManagers.deleteManager'),
      icon: <ExclamationCircleOutlined />,
      content: t('propertyManagers:propertyManagers.deleteManagerConfirm', { name: managerName }),
      okText: t('propertyManagers:propertyManagers.yes'),
      okType: 'danger',
      cancelText: t('propertyManagers:propertyManagers.cancel'),
      onOk() {
        deleteManagerMutation.mutate(managerId);
      },
    });
  };

  const handleManagerAdded = () => {
    setShowAddModal(false);
    messageApi.success(t('propertyManagers:propertyManagers.managerAdded'));
  };

  const columns: ColumnsType<PropertyManager> = [
    {
      title: t('propertyManagers:propertyManagers.name'),
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
      title: t('propertyManagers:propertyManagers.phone'),
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
      title: t('propertyManagers:propertyManagers.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email) =>
        email ? (
          <Space>
            <MailOutlined />
            <Text>{email}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: t('propertyManagers:propertyManagers.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('propertyManagers:propertyManagers.viewDetails')}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewManager(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title={t('propertyManagers:propertyManagers.delete')}>
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
                <IdcardOutlined /> {t('propertyManagers:propertyManagers.title')}
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
                  {t('propertyManagers:propertyManagers.addNewManager')}
                </Button>
              </div>
            </Col>
          </Row>
          <Text type="secondary">{t('propertyManagers:propertyManagers.subtitle')}</Text>
        </Space>
      </div>

      {/* Search Section */}
      <Card style={{ marginBottom: '16px' }} ref={searchRef}>
        <Search
          placeholder={t('propertyManagers:propertyManagers.searchPlaceholder')}
          allowClear
          prefix={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </Card>

      {/* Property Managers Table */}
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
            dataSource={managers}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 10,
              total: totalCount,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            onRow={(record) => ({
              onClick: () => handleViewManager(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <MobilePropertyManagersList
            managers={managers || []}
            loading={false}
            onDelete={handleDelete}
            onView={handleViewManager}
          />
        )}
      </Card>

      {/* Add Property Manager Modal */}
      <AddPropertyManagerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onManagerAdded={handleManagerAdded}
      />

      {/* Property Manager Detail / Edit Modal */}
      <PropertyManagerDetailModal
        isOpen={showDetailModal}
        managerId={selectedManagerId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedManagerId(null);
        }}
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

export default PropertyManagers;
