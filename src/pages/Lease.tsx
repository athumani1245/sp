import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
} from '@ant-design/icons';
import { useLease, useCancelPayment, useCancelLease } from '../hooks/useLeases';
import AddPaymentModal from '../components/forms/AddPaymentModal';

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

  // Use TanStack Query to fetch lease data
  const { data: lease, isLoading: loading, error, refetch } = useLease(leaseId || null);
  const cancelPaymentMutation = useCancelPayment();
  const cancelLeaseMutation = useCancelLease();
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [messageApi, contextHolder] = message.useMessage();

  // Show error message if fetch fails
  useEffect(() => {
    if (error) {
      messageApi.error('Failed to load lease details');
    }
  }, [error, messageApi]);

  const handleCancelLease = () => {
    Modal.confirm({
      title: 'Cancel Lease',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Are you sure you want to cancel this lease?</p>
          <p style={{ color: '#8c8c8c' }}>
            This action will immediately cancel the lease and cannot be undone.
          </p>
          {lease && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div>
                <strong>Tenant:</strong> {getTenantName(lease)}
              </div>
              <div>
                <strong>Property:</strong> {lease.property?.property_name || 'N/A'}
              </div>
              <div>
                <strong>Unit:</strong> {getUnitInfo(lease)}
              </div>
              <div>
                <strong>Duration:</strong> {lease.number_of_month} months
              </div>
            </div>
          )}
        </div>
      ),
      okText: 'Yes, Cancel Lease',
      okType: 'danger',
      cancelText: 'No, Keep Lease',
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
    try {
      setIsGeneratingPDF(true);
      messageApi.loading('Generating lease document...', 0);

      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      messageApi.destroy();
      messageApi.success('Document generated successfully!');
    } catch (error) {
      messageApi.destroy();
      messageApi.error('Failed to generate document');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRefresh = async () => {
    try {
      messageApi.loading('Refreshing lease data...', 0);
      await refetch();
      messageApi.destroy();
      messageApi.success('Lease data refreshed successfully!');
    } catch (error) {
      messageApi.destroy();
      messageApi.error('Failed to refresh lease data');
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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
    if (!lease || !lease.unit) return 'Unknown Unit';
    if (lease.unit.unit_name) return lease.unit.unit_name;
    if (lease.unit.unit_number) return `Unit ${lease.unit.unit_number}`;
    return 'Unknown Unit';
  };

  const getTenantName = (lease: Lease) => {
    if (!lease || !lease.tenant) return 'Unknown Tenant';
    if (lease.tenant.first_name && lease.tenant.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return 'Unknown Tenant';
  };

  const getPropertyAddress = (lease: Lease) => {
    if (!lease || !lease.property) return '';
    const { street, city, region } = lease.property;
    return [street, city, region].filter(Boolean).join(', ');
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Active' },
      draft: { color: 'default', text: 'Draft' },
      expired: { color: 'error', text: 'Expired' },
      expiring: { color: 'warning', text: 'Expiring Soon' },
      terminated: { color: 'default', text: 'Terminated' },
      cancelled: { color: 'error', text: 'Cancelled' },
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
    const baseSteps = [{ title: 'Draft' }, { title: 'Active' }, { title: 'Expired' }];

    if (status === 'cancelled') {
      return [{ title: 'Draft' }, { title: 'Active' }, { title: 'Cancelled' }];
    }

    if (status === 'terminated') {
      return [{ title: 'Draft' }, { title: 'Active' }, { title: 'Terminated' }];
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
          message="Lease Not Found"
          description="The lease you're looking for doesn't exist or has been removed."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/leases')}>
              Back to Leases
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
          <InfoCircleOutlined /> Details
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card title="Lease Information">
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Tenant">
                  <Space>
                    <UserOutlined />
                    <span>{getTenantName(lease)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  <span>{lease.tenant?.username || lease.tenant?.phone || 'N/A'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Property Name">
                  <Space>
                    <HomeOutlined />
                    <span>{lease.property?.property_name || 'N/A'}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Unit Number">
                  <span>{getUnitInfo(lease)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Lease Duration">
                  <span>{lease.number_of_month || 'N/A'} months</span>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  <Space>
                    <CalendarOutlined />
                    <span>{formatDate(lease.start_date)}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
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
                  <span>Payments Summary</span>
                </Space>
              }
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Total Amount
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.total_amount || 0)}
                  </Title>
                </div>

                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Paid Amount
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.amount_paid || 0)}
                  </Title>
                </div>

                {(lease.over_paid_amount || 0) > 0 && (
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      Overpaid Amount
                    </Text>
                    <Title level={5} style={{ margin: 0, color: '#595959' }}>
                      {formatCurrency(lease.over_paid_amount || 0)}
                    </Title>
                  </div>
                )}

                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Discount
                  </Text>
                  <Title level={5} style={{ margin: 0, color: '#595959' }}>
                    {formatCurrency(lease.discount || 0)}
                  </Title>
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 16 }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Remaining Amount
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
          <DollarOutlined /> Payments ({lease.payments?.length || 0})
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
              Add Payment
            </Button>
          }
        >
          {!lease.payments || lease.payments.length === 0 ? (
            <Empty description="No payments recorded for this lease" />
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
                  title: 'Date Paid',
                  dataIndex: 'date_paid',
                  key: 'date_paid',
                  render: (date) => formatDate(date),
                  width: 120,
                },
                {
                  title: 'Amount Paid',
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
                  title: 'Payment Source',
                  dataIndex: 'payment_source',
                  key: 'payment_source',
                  render: (source) => (
                    <Tag color="blue">{source || 'N/A'}</Tag>
                  ),
                  width: 130,
                },
                {
                  title: 'Category',
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
                        {category || 'N/A'}
                      </Tag>
                    );
                  },
                  width: 120,
                },
                {
                  title: 'Status',
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
                        {status || 'N/A'}
                      </Tag>
                    );
                  },
                  width: 100,
                },
                {
                  title: 'Actions',
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
                            title: 'Cancel Payment',
                            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
                            content: `Are you sure you want to cancel this payment of ${formatCurrency(parseFloat(record.amount_paid) || 0)}?`,
                            okText: 'Yes, Cancel',
                            okType: 'danger',
                            cancelText: 'No',
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
                        Cancel
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

  return (
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
            title: <Link to="/leases">Leases</Link>,
          },
          {
            title: lease.lease_number || 'Lease Details',
          },
        ]}
      />

      {/* Header Card with Title, Status and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
                  Refresh
                </Button>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadDocument}
                  loading={isGeneratingPDF}
                >
                  PDF
                </Button>
                {(lease.status === 'active' || lease.status === 'expiring') && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => setShowRenewModal(true)}
                  >
                    Renew
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
                      Cancel
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
            <FileTextOutlined /> {lease.lease_number || 'Lease Details'}
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
    </div>
  );
};

export default Lease;
