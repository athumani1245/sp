import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Skeleton,
  Descriptions,
  Tag,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Divider,
  Statistic,
  Tabs,
  Table,
  Tooltip,
  Alert,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useLease } from '../hooks/useLeases';
import { useLeasePayments } from '../hooks/usePayments';
import { useOriginalLease } from '../hooks/useLeases';
import AddPaymentModal from '../components/forms/AddPaymentModal';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const LeaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Fetch lease data
  const { data: lease, isLoading } = useLease(id || null);
  const { data: paymentsData, isLoading: paymentsLoading } = useLeasePayments(id || null);
  
  // Fetch original lease if this is a renewed lease
  const originalLeaseId = lease?.original_lease;
  const { data: originalLease, isLoading: originalLeaseLoading } = useOriginalLease(originalLeaseId);

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Active' },
      draft: { color: 'default', text: 'Draft' },
      expired: { color: 'error', text: 'Expired' },
      terminated: { color: 'default', text: 'Terminated' },
      cancelled: { color: 'warning', text: 'Cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // API returns dates in DD-MM-YYYY format, parse accordingly
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Skeleton.Button active size="small" style={{ width: 60 }} />
          <Skeleton.Button active size="small" style={{ width: 100 }} />
        </Breadcrumb>
        <Card>
          <Skeleton active avatar paragraph={{ rows: 8 }} />
          <Divider />
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Skeleton.Input active size="large" block />
            </Col>
            <Col span={8}>
              <Skeleton.Input active size="large" block />
            </Col>
            <Col span={8}>
              <Skeleton.Input active size="large" block />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  if (!lease) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Text>Lease not found</Text>
          <Button onClick={() => navigate('/leases')} style={{ marginLeft: 16 }}>
            Back to Leases
          </Button>
        </Card>
      </div>
    );
  }

  const balance = lease.total_amount - lease.amount_paid;

  return (
    <div style={{ padding: '24px' }}>
      <Space vertical size="large" style={{ width: '100%' }}>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/leases', title: 'Leases' },
            { title: lease.lease_number },
          ]}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <FileTextOutlined style={{ fontSize: '24px', color: '#CC5B4B' }} />
            <Title level={2} style={{ margin: 0 }}>
              {lease.lease_number}
            </Title>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Amount"
                value={lease.total_amount}
                prefix={<DollarOutlined />}
                formatter={(value) => `TSh ${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Amount Paid"
                value={lease.amount_paid}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => `TSh ${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Balance"
                value={balance}
                prefix={<DollarOutlined />}
                valueStyle={{ color: balance > 0 ? '#ff4d4f' : '#52c41a' }}
                formatter={(value) => `TSh ${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs for Lease Information and Payments */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Lease Information Tab */}
            <Tabs.TabPane tab="Lease Information" key="1">
              <Card title="Lease Details" bordered={false}>
            <Row gutter={16}>
              {/* Property Information */}
              <Col xs={24}>
                <Divider>Property & Tenant</Divider>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Property">
                    {lease.property?.property_name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Unit">
                    {lease.unit?.unit_name || lease.unit?.unit_number || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tenant">
                    {lease.tenant?.first_name && lease.tenant?.last_name
                      ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
                      : 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {/* Lease Dates */}
              <Col xs={24}>
                <Divider>Lease Period</Divider>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Start Date">
                    {formatDate(lease.start_date)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="End Date">
                    {formatDate(lease.end_date)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {/* Financial Information */}
              <Col xs={24}>
                <Divider>Financial Details</Divider>
              </Col>
              <Col xs={24} md={8}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Total Amount">
                    {formatCurrency(lease.total_amount)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={8}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Discount">
                    {formatCurrency(lease.discount || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={8}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Status">
                    {getStatusTag(lease.status)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {/* Additional Information */}
              {lease.number_of_month && (
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Number of Months">
                      {lease.number_of_month}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              )}
            </Row>
              </Card>
            </Tabs.TabPane>

            {/* Payments Tab */}
            <Tabs.TabPane tab="Payments" key="2">
              <Card
                title="Payment History"
                bordered={false}
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
                <Table
                  columns={[
                    {
                      title: 'Date Paid',
                      dataIndex: 'date_paid',
                      key: 'date_paid',
                      render: (date: string) => {
                        const [day, month, year] = date.split('-');
                        return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
                      },
                      sorter: (a: any, b: any) => {
                        const [dayA, monthA, yearA] = a.date_paid.split('-');
                        const [dayB, monthB, yearB] = b.date_paid.split('-');
                        return dayjs(`${yearA}-${monthA}-${dayA}`).unix() - dayjs(`${yearB}-${monthB}-${dayB}`).unix();
                      },
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'amount_paid',
                      key: 'amount_paid',
                      render: (amount: number) => `TSh ${amount.toLocaleString()}`,
                      sorter: (a: any, b: any) => a.amount_paid - b.amount_paid,
                    },
                    {
                      title: 'Category',
                      dataIndex: 'category',
                      key: 'category',
                      render: (category: string) => (
                        <Tag color="blue">{category || 'N/A'}</Tag>
                      ),
                    },
                    {
                      title: 'Payment Source',
                      dataIndex: 'payment_source',
                      key: 'payment_source',
                      render: (source: string) => source || 'N/A',
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => {
                        const isSuccess = status?.toLowerCase() === 'success';
                        return (
                          <Tag
                            icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            color={isSuccess ? 'success' : 'error'}
                          >
                            {status || 'N/A'}
                          </Tag>
                        );
                      },
                    },
                  ]}
                  dataSource={paymentsData?.items || []}
                  rowKey="id"
                  loading={paymentsLoading}
                  scroll={{ x: 1000 }}
                  pagination={{
                    pageSize: 10,
                    total: paymentsData?.pagination?.total || 0,
                  }}
                />
              </Card>
            </Tabs.TabPane>

            {/* History Tab */}
            {originalLeaseId && (
              <Tabs.TabPane tab={<span><HistoryOutlined /> History</span>} key="3">
                <Card title="Lease Renewal History" bordered={false}>
                  {originalLeaseLoading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : originalLease ? (
                    <>
                      <Alert
                        message="Renewal Information"
                        description="This lease is a renewal of a previous lease. Below are the details of the original lease."
                        type="info"
                        icon={<HistoryOutlined />}
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                      <Descriptions
                        bordered
                        column={{ xs: 1, sm: 1, md: 2 }}
                        size="small"
                      >
                        <Descriptions.Item label="Lease Number">
                          <Space>
                            <Text strong>{originalLease.lease_number}</Text>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => navigate(`/leases/${originalLease.id}`)}
                              style={{ padding: 0 }}
                            >
                              View Details
                            </Button>
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {getStatusTag(originalLease.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Property">
                          {originalLease.property?.property_name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Unit">
                          {originalLease.unit?.unit_name || originalLease.unit?.unit_number || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tenant">
                          {originalLease.tenant?.first_name && originalLease.tenant?.last_name
                            ? `${originalLease.tenant.first_name} ${originalLease.tenant.last_name}`
                            : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Duration">
                          {originalLease.number_of_month ? `${originalLease.number_of_month} months` : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                          {formatDate(originalLease.start_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="End Date">
                          {formatDate(originalLease.end_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Amount">
                          {formatCurrency(originalLease.total_amount)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount Paid">
                          <Text style={{ color: '#52c41a' }}>
                            {formatCurrency(originalLease.amount_paid)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Discount">
                          {formatCurrency(originalLease.discount || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Balance">
                          <Text
                            style={{
                              color:
                                originalLease.total_amount - originalLease.amount_paid > 0
                                  ? '#ff4d4f'
                                  : '#52c41a',
                            }}
                          >
                            {formatCurrency(originalLease.total_amount - originalLease.amount_paid)}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  ) : (
                    <Empty
                      description="Original lease information not available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Tabs.TabPane>
            )}
          </Tabs>
        </Card>
      </Space>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        leaseId={id!}
        onPaymentAdded={() => {
          // Payments will auto-refresh via TanStack Query
        }}
      />
    </div>
  );
};

export default LeaseDetail;
