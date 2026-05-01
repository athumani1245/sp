import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Steps,
  Tabs,
  Modal,
  message,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Skeleton,
  Alert,
  Empty,
  Table,
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  HistoryOutlined,
  FilePdfOutlined,
  EyeOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useLease, useCancelPayment, useCancelLease, useDeleteLease, useOriginalLease } from '../hooks/useLeases';
import AddPaymentModal from '../components/forms/AddPaymentModal';
import RenewLeaseModal from '../components/forms/RenewLeaseModal';
import TerminateLeaseModal from '../components/forms/TerminateLeaseModal';
import LeasePDFPreviewModal from '../components/pdf/LeasePDFPreviewModal';
import Chatter from '../components/chatter/Chatter';
import ChatterLayout from '../components/layout/ChatterLayout';

const { Title, Text } = Typography;

interface Property {
  property_name?: string;
  street?: string;
  city?: string;
  region?: string;
}

interface Unit {
  unit_name?: string;
  unit_number?: string;
}

interface Tenant {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
}

interface Lease {
  id: string;
  lease_number: string;
  property?: Property;
  unit?: Unit;
  tenant?: Tenant;
  start_date: string;
  end_date: string;
  number_of_month?: number;
  total_amount: number;
  amount_paid: number;
  over_paid_amount?: number;
  discount?: number;
  remaining_amount: number;
  status: string;
  original_lease?: any;
  payments?: any[];
}

const Lease: React.FC = () => {
  const { id: leaseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Use TanStack Query to fetch lease data
  const { data: lease, isLoading: loading, error, refetch } = useLease(leaseId || null);
  const cancelPaymentMutation = useCancelPayment();
  const cancelLeaseMutation = useCancelLease();
  const deleteLeaseMutation = useDeleteLease();
  
  // Fetch original lease if this is a renewed lease
  const originalLeaseId = lease?.original_lease;
  const { data: originalLease, isLoading: originalLeaseLoading } = useOriginalLease(originalLeaseId);
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [messageApi, contextHolder] = message.useMessage();

  // Show error message if fetch fails
  useEffect(() => {
    if (error) {
      messageApi.error(t('leases:leaseDetail.failedToLoad'));
    }
  }, [error, messageApi, t]);

  const handleDeleteLease = () => {
    Modal.confirm({
      title: t('leases:leases.deleteLease'),
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: t('leases:leases.deleteLeaseConfirm', { leaseNumber: lease?.lease_number }),
      okText: t('leases:leases.deleteLease'),
      okType: 'danger',
      cancelText: t('leases:leaseDetail.noKeepLease'),
      onOk: async () => {
        if (!leaseId) return;
        try {
          setIsDeleting(true);
          await deleteLeaseMutation.mutateAsync(leaseId);
          navigate('/leases');
        } catch (error) {
          console.error('Failed to delete lease:', error);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleCancelLease = () => {
    Modal.confirm({
      title: t('leases:leaseDetail.cancelLeaseTitle'),
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>{t('leases:leaseDetail.cancelLeaseConfirm')}</p>
          <p style={{ color: '#8c8c8c' }}>
            {t('leases:leaseDetail.cancelLeaseWarning')}
          </p>
          {lease && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div>
                <strong>{t('leases:leaseDetail.tenant')}:</strong> {getTenantName(lease)}
              </div>
              <div>
                <strong>{t('leases:leaseDetail.property')}:</strong> {lease.property?.property_name || t('leases:leaseDetail.na')}
              </div>
              <div>
                <strong>{t('leases:leaseDetail.unit')}:</strong> {getUnitInfo(lease)}
              </div>
              <div>
                <strong>{t('leases:leaseDetail.duration')}:</strong> {lease.number_of_month} {t('leases:leaseDetail.months')}
              </div>
            </div>
          )}
        </div>
      ),
      okText: t('leases:leaseDetail.yesCancelLease'),
      okType: 'danger',
      cancelText: t('leases:leaseDetail.noKeepLease'),
      onOk: async () => {
        if (!leaseId) return;
        
        try {
          setIsCancelling(true);
          await cancelLeaseMutation.mutateAsync(leaseId);
          refetch();
        } catch (error) {
          // Error message is handled by the mutation hook
          console.error('Failed to cancel lease:', error);
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const handleDownloadDocument = async () => {
    setShowPDFModal(true);
  };

  const handleRefresh = async () => {
    try {
      messageApi.loading(t('leases:leaseDetail.refreshing'), 0);
      await refetch();
      messageApi.destroy();
      messageApi.success(t('leases:leaseDetail.refreshSuccess'));
    } catch (error) {
      messageApi.destroy();
      messageApi.error(t('leases:leaseDetail.refreshFailed'));
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('leases:leaseDetail.na');
    try {
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
            const [day, month, year] = parts;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString();
            }
          }
          if (parts[0].length === 4) {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString();
            }
          }
        }
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
      return 'Invalid Date';
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getUnitInfo = (lease: Lease) => {
    if (!lease || !lease.unit) return t('leases:leases.unknownUnit');
    if (lease.unit.unit_name) return lease.unit.unit_name;
    if (lease.unit.unit_number) return `${t('leases:leases.unit')} ${lease.unit.unit_number}`;
    return t('leases:leases.unknownUnit');
  };

  const getTenantName = (lease: Lease) => {
    if (!lease || !lease.tenant) return t('leases:leases.unknownTenant');
    if (lease.tenant.first_name && lease.tenant.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return t('leases:leases.unknownTenant');
  };

  const getPropertyAddress = (lease: Lease) => {
    if (!lease || !lease.property) return '';
    const { street, city, region } = lease.property;
    return [street, city, region].filter(Boolean).join(', ');
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: t('leases:leaseDetail.active') },
      draft: { color: 'default', text: t('leases:leaseDetail.draft') },
      expired: { color: 'error', text: t('leases:leaseDetail.expired') },
      expiring: { color: 'warning', text: t('leases:leases.expiringSoon') },
      terminated: { color: 'default', text: t('leases:leaseDetail.terminated') },
      cancelled: { color: 'error', text: t('leases:leaseDetail.cancelled') },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusStep = (status: string) => {
    const statusMap: Record<string, number> = {
      draft: 0,
      active: 1,
      expired: 2,
      cancelled: 2,
      terminated: 2,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const getStepsItems = (status: string) => {
    const baseSteps = [
      { title: t('leases:leaseDetail.draft') },
      { title: t('leases:leaseDetail.active') },
      { title: t('leases:leaseDetail.expired') }
    ];

    if (status === 'cancelled') {
      return [
        { title: t('leases:leaseDetail.draft') },
        { title: t('leases:leaseDetail.active') },
        { title: t('leases:leaseDetail.cancelled') }
      ];
    }

    if (status === 'terminated') {
      return [
        { title: t('leases:leaseDetail.draft') },
        { title: t('leases:leaseDetail.active') },
        { title: t('leases:leaseDetail.terminated') }
      ];
    }

    return baseSteps;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Skeleton.Button active size="small" style={{ width: 60 }} />
          <Skeleton.Button active size="small" style={{ width: 100 }} />
        </Breadcrumb>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
        </Row>
        <Card style={{ marginBottom: 16 }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (!lease) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Alert
          message={t('leases:leaseDetail.leaseNotFoundTitle')}
          description={t('leases:leaseDetail.leaseNotFoundDesc')}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/leases')}>
              {t('leases:leaseDetail.backToLeases')}
            </Button>
          }
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'details',
      label: (
        <span>
          <InfoCircleOutlined /> {t('leases:leaseDetail.details')}
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card title={t('leases:leaseDetail.leaseInformation')}>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label={t('leases:leaseDetail.tenant')}>
                  <Space>
                    <UserOutlined />
                    <span>{getTenantName(lease)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.phoneNumber')}>
                  <span>{lease.tenant?.username || lease.tenant?.phone || t('leases:leaseDetail.na')}</span>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.propertyName')}>
                  <Space>
                    <HomeOutlined />
                    <span>{lease.property?.property_name || t('leases:leaseDetail.na')}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.unitNumber')}>
                  <span>{getUnitInfo(lease)}</span>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.leaseDuration')}>
                  <span>{lease.number_of_month || t('leases:leaseDetail.na')} {t('leases:leaseDetail.months')}</span>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.startDate')}>
                  <Space>
                    <CalendarOutlined />
                    <span>{formatDate(lease.start_date)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.endDate')}>
                  <Space>
                    <CalendarOutlined />
                    <span>{formatDate(lease.end_date)}</span>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>{t('leases:leaseDetail.paymentsSummary')}</span>
                </Space>
              }
            >
              <Space vertical size="large" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {t('leases:leaseDetail.totalAmount')}
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.total_amount || 0)}
                  </Title>
                </div>

                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {t('leases:leaseDetail.paidAmount')}
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.amount_paid || 0)}
                  </Title>
                </div>

                {(lease.over_paid_amount || 0) > 0 && (
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      {t('leases:leaseDetail.overpaidAmount')}
                    </Text>
                    <Title level={5} style={{ margin: 0, color: '#595959' }}>
                      {formatCurrency(lease.over_paid_amount || 0)}
                    </Title>
                  </div>
                )}

                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {t('leases:leaseDetail.discount')}
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.discount || 0)}
                  </Title>
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 16 }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {t('leases:leaseDetail.remainingAmount')}
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#262626' }}>
                    {formatCurrency(lease.remaining_amount || 0)}
                  </Title>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'payments',
      label: (
        <span>
          <DollarOutlined /> {t('leases:leaseDetail.payments')} ({lease.payments?.length || 0})
        </span>
      ),
      children: (
        <Card
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowPaymentModal(true)}
              style={{ backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' }}
            >
              {t('leases:leaseDetail.addPayment')}
            </Button>
          }
        >
          {!lease.payments || lease.payments.length === 0 ? (
            <Empty description={t('leases:leaseDetail.noPayments')} />
          ) : (
            <Table
              dataSource={lease.payments || []}
              rowKey="id"
              pagination={false}
              rowClassName={(record) => 
                record.status?.toLowerCase() !== 'paid' ? 'disabled-row' : ''
              }
              columns={[
                {
                  title: t('leases:leaseDetail.datePaid'),
                  dataIndex: 'date_paid',
                  key: 'date_paid',
                  render: (date) => formatDate(date),
                  width: 120,
                },
                {
                  title: t('leases:leaseDetail.amountPaidColumn'),
                  dataIndex: 'amount_paid',
                  key: 'amount_paid',
                  render: (amount) => (
                    <Text strong style={{ color: '#52c41a' }}>
                      {formatCurrency(parseFloat(amount) || 0)}
                    </Text>
                  ),
                  sorter: (a: any, b: any) => (parseFloat(a.amount_paid) || 0) - (parseFloat(b.amount_paid) || 0),
                  width: 150,
                },
                {
                  title: t('leases:leaseDetail.paymentSource'),
                  dataIndex: 'payment_source',
                  key: 'payment_source',
                  render: (source) => (
                    <Tag color="blue">{source || t('leases:leaseDetail.na')}</Tag>
                  ),
                  width: 130,
                },
                {
                  title: t('leases:leaseDetail.category'),
                  dataIndex: 'category',
                  key: 'category',
                  render: (category) => {
                    const categoryColors: Record<string, string> = {
                      RENT: 'purple',
                      WATER: 'cyan',
                      ELECTRICITY: 'gold',
                      MAINTENANCE: 'orange',
                      DEPOSIT: 'geekblue',
                    };
                    return (
                      <Tag color={categoryColors[category] || 'default'}>
                        {category || t('leases:leaseDetail.na')}
                      </Tag>
                    );
                  },
                  width: 120,
                },
                {
                  title: t('leases:leaseDetail.status'),
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusColors: Record<string, string> = {
                      paid: 'success',
                      pending: 'warning',
                      failed: 'error',
                      cancelled: 'default',
                    };
                    return (
                      <Tag color={statusColors[status?.toLowerCase()] || 'success'}>
                        {status || t('leases:leaseDetail.na')}
                      </Tag>
                    );
                  },
                  width: 100,
                },
                {
                  title: t('leases:leaseDetail.actions'),
                  key: 'actions',
                  render: (_: any, record: any) => {
                    const isPaid = record.status?.toLowerCase() === 'paid';
                    const isCancelled = record.status?.toLowerCase() === 'cancelled';
                    const isDisabled = !isPaid || isCancelled;
                    
                    return (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<CloseCircleOutlined />}
                        disabled={isDisabled}
                        style={{
                          fontSize: '12px',
                          height: '24px',
                          padding: '0 8px',
                          transition: 'all 0.3s ease',
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 77, 79, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={(e) => {
                          if (isDisabled) return;
                          e.stopPropagation();
                          Modal.confirm({
                            title: t('leases:leaseDetail.cancelPayment'),
                            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
                            content: t('leases:leaseDetail.cancelPaymentConfirm', { amount: formatCurrency(parseFloat(record.amount_paid) || 0) }),
                            okText: t('leases:leaseDetail.yesCancel'),
                            okType: 'danger',
                            cancelText: t('leases:leaseDetail.no'),
                            onOk: async () => {
                              try {
                                await cancelPaymentMutation.mutateAsync(record.id);
                                refetch();
                              } catch (error) {
                                // Error already handled by the mutation
                              }
                            },
                          });
                        }}
                      >
                        {t('leases:leases.cancel')}
                      </Button>
                    );
                  },
                  width: 100,
                },
              ]}
            />
          )}
        </Card>
      ),
    },
  ];

  // Add History tab if this lease has an original lease
  if (originalLeaseId) {
    tabItems.push({
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> {t('leases:leaseDetail.history')}
        </span>
      ),
      children: (
        <Card title={t('leases:leaseDetail.leaseRenewalHistory')}>
          {originalLeaseLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : originalLease ? (
            <>
              <Alert
                message={t('leases:leaseDetail.renewalInfo')}
                description={t('leases:leaseDetail.renewalInfoDesc')}
                type="info"
                icon={<HistoryOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Descriptions
                bordered
                column={{ xs: 1, sm: 1, md: 2 }}
                size="middle"
              >
                <Descriptions.Item label={t('leases:leaseDetail.leaseNumber')}>
                  <Space>
                    <Text strong>{originalLease.lease_number}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.status')}>
                  {getStatusTag(originalLease.status)}
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.property')}>
                  <Space>
                    <HomeOutlined />
                    <span>{originalLease.property?.property_name || t('leases:leaseDetail.na')}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.unit')}>
                  {getUnitInfo(originalLease)}
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.tenant')}>
                  <Space>
                    <UserOutlined />
                    <span>{getTenantName(originalLease)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.duration')}>
                  {originalLease.number_of_month ? `${originalLease.number_of_month} ${t('leases:leaseDetail.months')}` : t('leases:leaseDetail.na')}
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.startDate')}>
                  <Space>
                    <CalendarOutlined />
                    <span>{formatDate(originalLease.start_date)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.endDate')}>
                  <Space>
                    <CalendarOutlined />
                    <span>{formatDate(originalLease.end_date)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.totalAmountLabel')}>
                  {formatCurrency(originalLease.total_amount)}
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.amountPaid')}>
                  <Text style={{ color: '#52c41a' }}>
                    {formatCurrency(originalLease.amount_paid)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.discount')}>
                  {formatCurrency(originalLease.discount || 0)}
                </Descriptions.Item>
                <Descriptions.Item label={t('leases:leaseDetail.remainingBalance')}>
                  <Text
                    style={{
                      color:
                        (originalLease.remaining_amount || originalLease.total_amount - originalLease.amount_paid) > 0
                          ? '#ff4d4f'
                          : '#52c41a',
                    }}
                  >
                    {formatCurrency(originalLease.remaining_amount || originalLease.total_amount - originalLease.amount_paid)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : (
            <Empty
              description={t('leases:leaseDetail.originalLeaseNotAvailable')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      ),
    });
  }

  return (
    <ChatterLayout model="lease" recordId={leaseId || ''}>
      <div>
      {contextHolder}

      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: <Link to="/dashboard"><HomeOutlined /></Link>,
          },
          {
            title: <Link to="/leases">{t('leases:leaseDetail.leases')}</Link>,
          },
          {
            title: lease.lease_number || t('leases:leaseDetail.leaseDetails'),
          },
        ]}
      />

      {/* Header Card with Title, Status and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Space vertical style={{ width: '100%' }} size="middle">
          {/* Title and Quick Actions Row */}
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="small">
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  {t('leases:leases.refresh')}
                </Button>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadDocument}
                  loading={isGeneratingPDF}
                >
                  {t('leases:leaseDetail.pdf')}
                </Button>
                {(lease.status === 'active' || lease.status === 'expiring') && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => setShowRenewModal(true)}
                  >
                    {t('leases:leaseDetail.renew')}
                  </Button>
                )}
                {lease.status === 'active' && (
                  <Button
                    danger
                    size="small"
                    icon={<StopOutlined />}
                    onClick={() => setShowTerminateModal(true)}
                  >
                    {t('leases:leaseDetail.terminate')}
                  </Button>
                )}
                {lease.status !== 'cancelled' &&
                  lease.status !== 'terminated' &&
                  lease.status !== 'expired' && (
                    <Button
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={handleCancelLease}
                      loading={isCancelling}
                    >
                      {t('leases:leases.cancel')}
                    </Button>
                  )}
                { (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteLease}
                    loading={isDeleting}
                  >
                    {t('leases:leases.deleteLease')}
                  </Button>
                )}
              </Space>
            </Col>
            <Col>
              {getStatusTag(lease.status)}
            </Col>
          </Row>
          
          {/* Lease Number */}
          <Title level={4} style={{ margin: 0 }}>
            <FileTextOutlined /> {lease.lease_number || t('leases:leaseDetail.leaseDetails')}
          </Title>
        </Space>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        defaultActiveKey="details"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        leaseId={leaseId!}
        onPaymentAdded={() => {
          // Payments will auto-refresh via TanStack Query
        }}
      />

      {/* Renew Lease Modal */}
      <RenewLeaseModal
        visible={showRenewModal}
        onCancel={() => setShowRenewModal(false)}
        onSuccess={() => {
          refetch();
        }}
        lease={lease}
      />

      {/* Terminate Lease Modal */}
      <TerminateLeaseModal
        visible={showTerminateModal}
        onCancel={() => setShowTerminateModal(false)}
        onSuccess={() => {
          setShowTerminateModal(false);
          refetch();
        }}
        lease={lease}
      />

      {/* PDF Preview Modal */}
      {showPDFModal && lease && (
        <LeasePDFPreviewModal
          open={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          lease={lease}
        />
      )}

      {/* Chatter - Attachments */}
      </div>
    </ChatterLayout>
  );
};

export default Lease;
