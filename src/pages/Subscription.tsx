import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Alert,
  Spin,
  Descriptions,
} from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  RocketOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../context/AuthContext';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createSubscription,
  startPaymentStatusListener,
  stopPaymentStatusListener,
  getBillingHistory,
} from '../services/subscriptionService';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

interface BillingHistory {
  id: number;
  subscription_id: string;
  user: string;
  plan_name: string | null;
  package_name: string | null;
  amount: string;
  payment_date: string;
  status: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: string;
  duration_days: number;
  max_units: number | null;
  max_property_managers: number | null;
  features: string[];
  full_price?: number;
  discount_amount?: number;
  discounted_price?: number;
}

interface Package {
  id: number;
  name: string;
  description: string;
  max_units: number | null;
  max_property_managers: number | null;
  plans: Plan[];
}

const Subscription: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription } = useAuth();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<{[key: number]: Plan}>({});
  const [detailedSubscription, setDetailedSubscription] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiResponseDescription, setApiResponseDescription] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchCurrentSubscription();
    fetchSubscriptionPlans();
    setLoading(false);
  }, [navigate]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await getCurrentSubscription();
      if (response.success && response.data) {
        setDetailedSubscription(response.data);
      }
    } catch (error) {
      // Silent fail
    }

    try {
      const billingResponse = await getBillingHistory();
      if (billingResponse.success && billingResponse.data) {
        setBillingHistory(billingResponse.data);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await getSubscriptionPlans();

      if (response.success && response.data) {
        setPackages(response.data);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setPlansLoading(false);
    }
  };

  const handleSelectPackage = (packageId: number) => {
    if (selectedPackage === packageId) {
      setSelectedPackage(null);
    } else {
      setSelectedPackage(packageId);
    }
  };

  const handleSelectPlan = (packageId: number, plan: Plan) => {
    setSelectedPlans(prev => ({
      ...prev,
      [packageId]: plan
    }));
    setSelectedPackage(null);
  };

  const handleCancelPlanSelection = (packageId: number) => {
    setSelectedPlans(prev => {
      const updated = { ...prev };
      delete updated[packageId];
      return updated;
    });
  };

  const handleProceedToPayment = (packageId: number) => {
    const plan = selectedPlans[packageId];
    if (!plan) return;
    
    setSelectedPlan(plan);
    setShowConfirmModal(true);
    setPhoneNumber('');
    setSubscriptionError('');
    setApiResponseDescription('');
  };

  const handleConfirmSubscription = async () => {
    if (!phoneNumber || phoneNumber.length !== 9) {
      setSubscriptionError(t('subscription:confirmModal.phoneNumberError'));
      return;
    }

    setShowConfirmModal(false);
    setShowPaymentModal(true);
    setPaymentStatus('processing');
    setSubscribing(true);
    setSubscriptionError('');
    setApiResponseDescription('');

    try {
      const result = await createSubscription({
        plan: selectedPlan!.id,
        phone_number: `255${phoneNumber}`,
        auto_renew: true,
      });

      if (result.success) {
        setApiResponseDescription(result.description || result.message || '');
        setCurrentTransactionId(result.transactionId || null);

        if (result.requiresUserAction || result.status === 200) {
          if (result.transactionId) {
            startPaymentStatusListener(
              result.transactionId,
              (statusUpdate) => {
                const paymentStatusValue = statusUpdate.paymentStatus?.toUpperCase();

                if (paymentStatusValue === 'PAYMENT_ACCEPTED' || paymentStatusValue === 'PAYMENT_SUCCESS') {
                  setPaymentStatus('success');
                  setApiResponseDescription(statusUpdate.data?.narration || 'Payment completed successfully!');
                  setSubscribing(false);

                  setTimeout(() => {
                    handlePaymentSuccess();
                  }, 3000);
                } else if (paymentStatusValue === 'PAYMENT_FAILED' || paymentStatusValue === 'PAYMENT_CANCELLED') {
                  setPaymentStatus('failed');
                  setApiResponseDescription(statusUpdate.message || statusUpdate.data?.narration || 'Payment failed');
                  setSubscribing(false);
                } else if (paymentStatusValue === 'PAYMENT_PENDING' || paymentStatusValue === 'PAYMENT_PROCESSING') {
                  setPaymentStatus('processing');
                  if (statusUpdate.message || statusUpdate.data?.narration) {
                    setApiResponseDescription(statusUpdate.message || statusUpdate.data?.narration);
                  }
                }
              },
              {
                pollInterval: 3000,
                maxAttempts: 20,
                onTimeout: () => {
                  setPaymentStatus('failed');
                  setApiResponseDescription('Payment verification timed out after 60 seconds. The transaction may still be processing. Please check your mobile money account or contact support for assistance.');
                  setSubscribing(false);
                },
                onError: () => {
                  // Silent fail
                },
              }
            );
          }
        } else {
          setPaymentStatus('success');
          setSubscribing(false);

          setTimeout(() => {
            handlePaymentSuccess();
          }, 3000);
        }
      } else {
        setPaymentStatus('failed');
        setApiResponseDescription(result.message || 'Failed to create subscription');
        setSubscribing(false);
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      setApiResponseDescription('Failed to process subscription');
      setSubscribing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setPaymentStatus('processing');
    setApiResponseDescription('');
    setCurrentTransactionId(null);
    setPhoneNumber('');
    setSelectedPlan(null);
    form.resetFields();

    fetchCurrentSubscription();
    messageApi.success(t('subscription:messages.successActivated'));
  };

  const handleClosePaymentModal = () => {
    if (paymentStatus === 'processing') return;

    if (currentTransactionId) {
      stopPaymentStatusListener(currentTransactionId);
    }

    setShowPaymentModal(false);
    setPaymentStatus('processing');
    setApiResponseDescription('');
    setCurrentTransactionId(null);
    setPhoneNumber('');
    setSelectedPlan(null);
    form.resetFields();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmModal(false);
    setPhoneNumber('');
    setSubscriptionError('');
    setApiResponseDescription('');
  };

  const handleCancelPayment = () => {
    if (currentTransactionId) {
      stopPaymentStatusListener(currentTransactionId);
    }

    setShowPaymentModal(false);
    setShowConfirmModal(true);
    setPaymentStatus('processing');
    setSubscribing(false);
    setCurrentTransactionId(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      // Handle DD-MM-YYYY format from API
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${day}/${month}/${year}`;
      }
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };

  const getStatusTag = () => {
    if (hasActiveSubscription) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>{t('subscription:status.active')}</Tag>;
    }
    return <Tag color="error" icon={<CloseCircleOutlined />}>{t('subscription:status.expired')}</Tag>;
  };

  const billingColumns: ColumnsType<BillingHistory> = [
    {
      title: t('subscription:billingHistory.date'),
      dataIndex: 'payment_date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: t('subscription:billingHistory.package'),
      dataIndex: 'package_name',
      key: 'package',
      render: (packageName: string | null) => packageName || 'N/A',
    },
    {
      title: t('subscription:billingHistory.plan'),
      dataIndex: 'plan_name',
      key: 'plan',
      render: (planName: string | null) => planName || 'N/A',
    },
    {
      title: t('subscription:billingHistory.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => formatCurrency(parseFloat(amount)),
    },
    {
      title: t('subscription:billingHistory.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : status === 'pending' ? 'processing' : 'error'}>
          {status === 'success' ? t('subscription:billingHistory.statusSuccess') : status === 'pending' ? t('subscription:billingHistory.statusPending') : t('subscription:billingHistory.statusFailed')}
        </Tag>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <CreditCardOutlined /> {t('subscription:title')}
          </Title>
          <Text type="secondary">{t('subscription:subtitle')}</Text>
        </div>

        {/* Current Subscription and Billing History */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <RocketOutlined />
                  {t('subscription:currentPlan.title')}
                </Space>
              }
              extra={getStatusTag()}
              style={{ height: '100%' }}
            >
              {subscription ? (
                <Space vertical size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#CC5B4B' }}>
                      {subscription.package_name || 'N/A'}
                    </Title>
                    <Text type="secondary">{subscription.plan_name || 'N/A'}</Text>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <Descriptions column={2} size="small">
                    <Descriptions.Item label={<><CalendarOutlined /> {t('subscription:currentPlan.startDate')}</>}>
                      {formatDate(subscription.start_date)}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><CalendarOutlined /> {t('subscription:currentPlan.endDate')}</>}>
                      {formatDate(subscription.end_date)}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><HomeOutlined /> {t('subscription:currentPlan.maxUnits')}</>}>
                      {subscription.max_units || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>

                  <Card
                    size="small"
                    style={{
                      backgroundColor: hasActiveSubscription ? '#f6ffed' : '#fff1f0',
                      borderColor: hasActiveSubscription ? '#b7eb8f' : '#ffccc7',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ margin: 0, color: '#CC5B4B' }}>
                        {subscription.days_left || 0}
                      </Title>
                      <Text type="secondary">{t('subscription:currentPlan.daysRemaining')}</Text>
                    </div>
                  </Card>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <Title level={4} style={{ marginTop: '16px' }}>
                    {t('subscription:currentPlan.noSubscription')}
                  </Title>
                  <Text type="secondary">{t('subscription:currentPlan.noSubscriptionDesc')}</Text>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  {t('subscription:billingHistory.title')}
                </Space>
              }
              style={{ height: '100%' }}
            >
              <Table
                columns={billingColumns}
                dataSource={billingHistory}
                rowKey="id"
                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                scroll={{ x: 600 }}
                size="small"
                locale={{ emptyText: t('subscription:billingHistory.noHistory') }}
              />
            </Card>
          </Col>
        </Row>

        {/* Available Packages */}
        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              <RocketOutlined /> {t('subscription:packages.title')}
            </Title>
          }
          loading={plansLoading}
        >
          <Row gutter={[16, 16]}>
            {packages.map((pkg) => {
              const selectedPlan = selectedPlans[pkg.id];
              const hasPlans = pkg.plans && pkg.plans.length > 0;
              const isExpanded = selectedPackage === pkg.id;

              return (
                <Col xs={24} sm={12} lg={8} key={pkg.id}>
                  <Card
                    hoverable={hasPlans}
                    style={{
                      height: '100%',
                      borderColor: selectedPlan ? '#52c41a' : undefined,
                      borderWidth: selectedPlan ? 2 : 1,
                      cursor: hasPlans ? 'pointer' : 'not-allowed',
                      opacity: !hasPlans ? 0.6 : 1,
                    }}
                    onClick={() => hasPlans && handleSelectPackage(pkg.id)}
                  >
                    <Space vertical size="middle" style={{ width: '100%' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Title level={4} style={{ margin: 0 }}>
                            {pkg.name}
                          </Title>
                          {selectedPlan && (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                          )}
                        </div>
                        {pkg.description && (
                          <Text type="secondary">{pkg.description}</Text>
                        )}
                      </div>

                      {/* Package Features */}
                      <Space vertical size="small" style={{ width: '100%' }}>
                        {pkg.max_units && (
                          <Text>
                            <HomeOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                            {t('subscription:packages.upTo')} {pkg.max_units} {t('subscription:packages.units')}
                          </Text>
                        )}
                        {pkg.max_property_managers && (
                          <Text>
                            <TeamOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                            {t('subscription:packages.upTo')} {pkg.max_property_managers} {t('subscription:packages.propertyManagers')}
                          </Text>
                        )}
                      </Space>

                      {/* Selected Plan Display */}
                      {selectedPlan && (
                        <Alert
                          message={
                            <Space vertical size={0}>
                              <Text strong>{t('subscription:packages.selected')}: {selectedPlan.name}</Text>
                              {selectedPlan.full_price && selectedPlan.discount_amount && selectedPlan.discount_amount > 0 ? (
                                <>
                                  <div>
                                    <Text delete type="secondary" style={{ fontSize: '12px', marginRight: 8 }}>
                                      {formatCurrency(selectedPlan.full_price)}
                                    </Text>
                                    <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                                      {formatCurrency(selectedPlan.discounted_price || selectedPlan.price)}
                                    </Text>
                                  </div>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {t('subscription:packages.youSave')} {formatCurrency(selectedPlan.discount_amount)} • {selectedPlan.duration_days} {t('subscription:packages.days')}
                                  </Text>
                                </>
                              ) : (
                                <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                                  {formatCurrency(selectedPlan.price)} / {selectedPlan.duration_days} {t('subscription:packages.days')}
                                </Text>
                              )}
                            </Space>
                          }
                          type="success"
                          showIcon
                          style={{ padding: '8px 12px' }}
                        />
                      )}

                      {/* Plans List (Expanded) */}
                      {isExpanded && hasPlans && (
                        <>
                          <Divider style={{ margin: '8px 0' }}>{t('subscription:packages.availablePlans')}</Divider>
                          <Space vertical size="small" style={{ width: '100%' }}>
                            {pkg.plans.map((plan) => (
                              <Card
                                key={plan.id}
                                size="small"
                                hoverable
                                style={{
                                  borderColor: selectedPlan?.id === plan.id ? '#52c41a' : '#d9d9d9',
                                  borderWidth: selectedPlan?.id === plan.id ? 2 : 1,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectPlan(pkg.id, plan);
                                }}
                              >
                                <Space vertical size={0} style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>{plan.name}</Text>
                                    {plan.discount_amount && plan.discount_amount > 0 && (
                                      <Tag color="success" style={{ margin: 0 }}>{t('subscription:packages.save')} {formatCurrency(plan.discount_amount)}</Tag>
                                    )}
                                  </div>
                                  
                                  {plan.full_price && plan.discount_amount && plan.discount_amount > 0 ? (
                                    <>
                                      <Text delete type="secondary" style={{ fontSize: '14px' }}>
                                        {formatCurrency(plan.full_price)}
                                      </Text>
                                      <Text style={{ color: '#CC5B4B', fontWeight: 600, fontSize: '16px' }}>
                                        {formatCurrency(plan.discounted_price || plan.price)}
                                      </Text>
                                    </>
                                  ) : (
                                    <Text style={{ color: '#CC5B4B', fontWeight: 600, fontSize: '16px' }}>
                                      {formatCurrency(plan.price)}
                                    </Text>
                                  )}
                                  
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {plan.duration_days} {t('subscription:packages.days')}
                                  </Text>
                                </Space>
                              </Card>
                            ))}
                          </Space>
                        </>
                      )}

                      {/* Action Buttons */}
                      <Space vertical size="small" style={{ width: '100%' }}>
                        {!selectedPlan && hasPlans && (
                          <Button
                            type="primary"
                            block
                            size="large"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPackage(pkg.id);
                            }}
                          >
                            {isExpanded ? t('subscription:packages.close') : `${pkg.plans.length > 1 ? t('subscription:packages.viewPlans', {count: pkg.plans.length}) : t('subscription:packages.viewPlan', {count: pkg.plans.length})}`}
                          </Button>
                        )}

                        {selectedPlan && (
                          <>
                            <Button
                              type="primary"
                              block
                              size="large"
                              icon={<CreditCardOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProceedToPayment(pkg.id);
                              }}
                            >
                              {t('subscription:packages.proceedToPayment')}
                            </Button>
                            <Button
                              block
                              size="large"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelPlanSelection(pkg.id);
                              }}
                            >
                              {t('subscription:packages.changePlan')}
                            </Button>
                          </>
                        )}

                        {!hasPlans && (
                          <Button block size="large" disabled>
                            {t('subscription:packages.noPlansAvailable')}
                          </Button>
                        )}
                      </Space>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* Confirmation Modal */}
        <Modal
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              {t('subscription:confirmModal.title')}
            </Space>
          }
          open={showConfirmModal}
          onCancel={handleCancelConfirmation}
          closable={!subscribing}
          maskClosable={!subscribing}
          footer={[
            <Button key="back" onClick={handleCancelConfirmation} disabled={subscribing}>
              {t('subscription:confirmModal.back')}
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleConfirmSubscription}
              loading={subscribing}
              disabled={!phoneNumber || phoneNumber.length !== 9}
            >
              {t('subscription:confirmModal.confirmAndPay')}
            </Button>,
          ]}
          width={600}
        >
          {selectedPlan && (
            <div>
              <Title level={5} style={{ marginBottom: '16px' }}>
                {t('subscription:confirmModal.heading')}
              </Title>

              <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                <Descriptions.Item label={t('subscription:confirmModal.selectedPlan')}>
                  <Text strong>{selectedPlan.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('subscription:confirmModal.duration')}>{selectedPlan.duration_days} {t('subscription:packages.days')}</Descriptions.Item>
                <Descriptions.Item label={t('subscription:confirmModal.amount')}>
                  <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                    {formatCurrency(selectedPlan.price)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <Alert
                message={t('subscription:confirmModal.paymentInfo')}
                description={t('subscription:confirmModal.paymentInfoDesc')}
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Form.Item
                label={t('subscription:confirmModal.phoneNumber')}
                required
                validateStatus={subscriptionError ? 'error' : ''}
                help={subscriptionError || t('subscription:confirmModal.phoneNumberHelp')}
              >
                <Input
                  size="large"
                  prefix="+255"
                  placeholder="7XXXXXXXX"
                  maxLength={9}
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 9) {
                      setPhoneNumber(value);
                      setSubscriptionError('');
                    }
                  }}
                  disabled={subscribing}
                />
              </Form.Item>

              {subscriptionError && (
                <Alert message={subscriptionError} type="error" showIcon style={{ marginBottom: '16px' }} />
              )}
            </div>
          )}
        </Modal>

        {/* Payment Modal */}
        <Modal
          title={
            paymentStatus === 'processing' ? (
              <Space>
                <PhoneOutlined style={{ color: '#1890ff' }} />
                {t('subscription:paymentModal.titleProcessing')}
              </Space>
            ) : paymentStatus === 'success' ? (
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                {t('subscription:paymentModal.titleSuccess')}
              </Space>
            ) : (
              <Space>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                {t('subscription:paymentModal.titleFailed')}
              </Space>
            )
          }
          open={showPaymentModal}
          onCancel={paymentStatus !== 'processing' ? handleClosePaymentModal : undefined}
          closable={paymentStatus !== 'processing'}
          maskClosable={false}
          footer={
            paymentStatus === 'processing'
              ? [
                  <Button key="cancel" onClick={handleCancelPayment}>
                    {t('subscription:paymentModal.cancelPayment')}
                  </Button>,
                ]
              : paymentStatus === 'success'
              ? [
                  <Button key="continue" type="primary" onClick={handlePaymentSuccess} block>
                    {t('subscription:paymentModal.continue')}
                  </Button>,
                ]
              : [
                  <Button key="close" onClick={handleClosePaymentModal} block>
                    {t('subscription:paymentModal.close')}
                  </Button>,
                ]
          }
          width={600}
        >
          {paymentStatus === 'processing' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="large" style={{ marginBottom: '24px' }} />
              <Title level={4} style={{ marginBottom: '16px' }}>
                {t('subscription:paymentModal.waitingForPayment')}
              </Title>

              <Alert
                message={apiResponseDescription || t('subscription:paymentModal.checkPhone')}
                type="info"
                showIcon
                style={{ marginBottom: '16px', textAlign: 'left' }}
              />

              <Card style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">{t('subscription:paymentModal.amount')}:</Text>
                    <div>
                      <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                        {formatCurrency(selectedPlan?.price)}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{t('subscription:paymentModal.phone')}:</Text>
                    <div>
                      <Text strong>+255 {phoneNumber}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <Title level={5}>{t('subscription:paymentModal.followSteps')}:</Title>
                <Space vertical style={{ width: '100%' }}>
                  <div>
                    <Text strong>1.</Text> {t('subscription:paymentModal.step1')}
                  </div>
                  <div>
                    <Text strong>2.</Text> {t('subscription:paymentModal.step2')}
                  </div>
                  <div>
                    <Text strong>3.</Text> {t('subscription:paymentModal.step3')}
                  </div>
                  <div>
                    <Text strong>4.</Text> {t('subscription:paymentModal.step4')}
                  </div>
                </Space>
              </div>

              <Text type="secondary">
                <ClockCircleOutlined /> {t('subscription:paymentModal.processing')}
              </Text>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
              <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
                {t('subscription:paymentModal.successHeading')}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                {apiResponseDescription || t('subscription:paymentModal.successDesc')}
              </Paragraph>

              {selectedPlan && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">{t('subscription:paymentModal.plan')}:</Text>
                      <div>
                        <Text strong>{selectedPlan.name}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">{t('subscription:confirmModal.duration')}:</Text>
                      <div>
                        <Text strong>{selectedPlan.duration_days} {t('subscription:packages.days')}</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              <Alert
                message={t('subscription:paymentModal.accountUpgraded')}
                type="success"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Text type="secondary">{t('subscription:paymentModal.autoCloseMessage')}</Text>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CloseCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '24px' }} />
              <Title level={3} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                {t('subscription:paymentModal.failedHeading')}
              </Title>

              {apiResponseDescription && (
                <Alert message={apiResponseDescription} type="error" showIcon style={{ marginBottom: '16px' }} />
              )}

              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <Paragraph type="secondary">{t('subscription:paymentModal.failedReasons')}</Paragraph>
                <ul style={{ textAlign: 'left', color: '#8c8c8c' }}>
                  <li>{t('subscription:paymentModal.reason1')}</li>
                  <li>{t('subscription:paymentModal.reason2')}</li>
                  <li>{t('subscription:paymentModal.reason3')}</li>
                  <li>{t('subscription:paymentModal.reason4')}</li>
                </ul>
              </div>

              <Alert
                message={t('subscription:paymentModal.checkBalance')}
                type="info"
                showIcon
              />
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Subscription;
