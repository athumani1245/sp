import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Divider,
  Table,
  Space,
  DatePicker,
  message as antMessage,
  Descriptions,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useRenewLease } from '../../hooks/useLeases';

const { Option } = Select;

interface Payment {
  key: string;
  payment_date?: string;
  category: string;
  payment_source?: string;
  amount_paid?: string;
}

interface Lease {
  id: string;
  lease_number: string;
  property?: {
    property_name: string;
  };
  unit?: {
    unit_name?: string;
    unit_number?: string;
  };
  tenant?: {
    first_name: string;
    last_name: string;
  };
  start_date: string;
  end_date: string;
  rent_amount_per_unit?: number;
  total_amount: number;
  status: string;
}

interface RenewLeaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  lease: Lease | null;
}

const PAYMENT_CATEGORIES = [
  { value: 'RENT', label: 'Rent' },
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'SERVICE_CHARGE', label: 'Service Charge' },
  { value: 'Security Deposit', label: 'Security Deposit' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_SOURCES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'MB', label: 'Mobile Money' },
  { value: 'BANK', label: 'Bank Transfer' },
];

const RenewLeaseModal: React.FC<RenewLeaseModalProps> = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  lease 
}) => {
  const [form] = Form.useForm();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const renewLeaseMutation = useRenewLease();

  // Format date from DD-MM-YYYY to YYYY-MM-DD for dayjs
  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`);
  };

  // Format date from dayjs to DD-MM-YYYY for API
  const formatDateForApi = (date: Dayjs | null): string => {
    if (!date) return '';
    return date.format('DD-MM-YYYY');
  };

  useEffect(() => {
    if (visible && lease) {
      const currentEndDate = parseDate(lease.end_date);
      const suggestedStartDate = currentEndDate ? currentEndDate.add(1, 'day') : dayjs();
      const suggestedEndDate = suggestedStartDate.add(6, 'month');

      form.setFieldsValue({
        start_date: suggestedStartDate,
        end_date: suggestedEndDate,
        number_of_month: 6,
        rent_amount_per_unit: lease.rent_amount_per_unit || 0,
      });

      setPayments([]);
    }
  }, [visible, lease, form]);

  const handleAddPayment = () => {
    const category = form.getFieldValue('new_payment_category');
    const amount = form.getFieldValue('new_payment_amount');
    const source = form.getFieldValue('new_payment_source');
    const date = form.getFieldValue('new_payment_date');

    if (!category) {
      antMessage.warning('Please select a payment category');
      return;
    }

    const newPayment: Payment = {
      key: Date.now().toString(),
      category,
      amount_paid: amount ? String(amount) : undefined,
      payment_source: source || undefined,
      payment_date: date ? date.format('YYYY-MM-DD') : undefined,
    };

    setPayments([...payments, newPayment]);
    form.resetFields(['new_payment_category', 'new_payment_amount', 'new_payment_source', 'new_payment_date']);
    setIsAddingPayment(false);
  };

  const handleRemovePayment = (key: string) => {
    setPayments(payments.filter(p => p.key !== key));
  };

  const calculateTotalAmount = () => {
    const rentAmount = form.getFieldValue('rent_amount_per_unit') || 0;
    const numberOfMonths = form.getFieldValue('number_of_month') || 0;
    return rentAmount * numberOfMonths;
  };

  const handleMonthsChange = (months: number | null) => {
    if (months && months > 0) {
      const startDate = form.getFieldValue('start_date');
      if (startDate) {
        const endDate = startDate.add(months, 'month').subtract(1, 'day');
        form.setFieldsValue({ end_date: endDate });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!lease) {
        antMessage.error('Lease information is missing');
        return;
      }

      // Format payments for API - only include fields with actual values
      const formattedPayments = payments.map(payment => {
        const paymentObj: any = {
          category: payment.category,
        };

        // Only add amount_paid if it has a value
        if (payment.amount_paid && payment.amount_paid.trim() !== '') {
          paymentObj.amount_paid = payment.amount_paid;
        }
        
        // Only add payment_source if it has a value
        if (payment.payment_source && payment.payment_source.trim() !== '') {
          paymentObj.payment_source = payment.payment_source;
        }

        // Only add payment_date if it has a value
        if (payment.payment_date) {
          paymentObj.payment_date = formatDateForApi(dayjs(payment.payment_date));
        }

        return paymentObj;
      });

      const renewalData = {
        original_lease: lease.id,
        start_date: formatDateForApi(values.start_date),
        end_date: formatDateForApi(values.end_date),
        number_of_month: values.number_of_month,
        rent_amount_per_unit: values.rent_amount_per_unit,
        payments: formattedPayments,
      };

      await renewLeaseMutation.mutateAsync({
        leaseId: lease.id,
        renewalData,
      });

      form.resetFields();
      setPayments([]);
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Failed to renew lease:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPayments([]);
    onCancel();
  };

  const paymentColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (value: string) => {
        const cat = PAYMENT_CATEGORIES.find(c => c.value === value);
        return cat ? cat.label : value;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (value: string) => value ? `TSh ${Number(value).toLocaleString()}` : '—',
    },
    {
      title: 'Source',
      dataIndex: 'payment_source',
      key: 'payment_source',
      render: (value: string) => {
        const src = PAYMENT_SOURCES.find(s => s.value === value);
        return src ? src.label : (value || '—');
      },
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (value: string) => value ? dayjs(value).format('DD-MM-YYYY') : '—',
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_: any, record: Payment) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePayment(record.key)}
        />
      ),
    },
  ];

  if (!lease) return null;

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#CC5B4B' }} />
          <span>Renew Lease</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={renewLeaseMutation.isPending}
          onClick={handleSubmit}
          style={{ backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' }}
        >
          Renew Lease
        </Button>,
      ]}
    >
      <Alert
        message="Lease Renewal"
        description={`You are renewing the lease for ${lease.tenant?.first_name} ${lease.tenant?.last_name} at ${lease.property?.property_name}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Current Lease Information */}
      <Descriptions title="Current Lease" bordered size="small" column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Lease Number">{lease.lease_number}</Descriptions.Item>
        <Descriptions.Item label="Status">{lease.status}</Descriptions.Item>
        <Descriptions.Item label="Current Start">{lease.start_date}</Descriptions.Item>
        <Descriptions.Item label="Current End">{lease.end_date}</Descriptions.Item>
        <Descriptions.Item label="Rent Amount">
          TSh {(lease.rent_amount_per_unit || 0).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Unit">
          {lease.unit?.unit_name || lease.unit?.unit_number || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Divider>New Lease Period</Divider>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Number of Months"
              name="number_of_month"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={1}
                max={24}
                style={{ width: '100%' }}
                onChange={handleMonthsChange}
                placeholder="e.g., 6"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              label="Start Date"
              name="start_date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                onChange={(date) => {
                  const months = form.getFieldValue('number_of_month');
                  if (date && months) {
                    const endDate = date.add(months, 'month').subtract(1, 'day');
                    form.setFieldsValue({ end_date: endDate });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              label="End Date"
              name="end_date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Rent Amount Per Month"
              name="rent_amount_per_unit"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={(value) => `TSh ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => (value!.replace(/TSh\s?|(,*)/g, '') as any)}
                placeholder="e.g., 70000"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Total Amount (Auto-calculated)" shouldUpdate>
              {() => (
                <Input
                  value={`TSh ${calculateTotalAmount().toLocaleString()}`}
                  disabled
                  style={{ fontWeight: 'bold' }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider>Initial Payments (Optional)</Divider>

      {payments.length > 0 && (
        <Table
          dataSource={payments}
          columns={paymentColumns}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />
      )}

      {isAddingPayment && (
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <Row gutter={12}>
            <Col xs={24} sm={6}>
              <Form.Item name="new_payment_category" label="Category" style={{ marginBottom: 8 }}>
                <Select placeholder="Select category">
                  {PAYMENT_CATEGORIES.map(cat => (
                    <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="new_payment_amount" label="Amount" style={{ marginBottom: 8 }}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Amount (optional)"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="new_payment_source" label="Payment Source" style={{ marginBottom: 8 }}>
                <Select placeholder="Source (optional)" allowClear>
                  {PAYMENT_SOURCES.map(src => (
                    <Option key={src.value} value={src.value}>{src.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="new_payment_date" label="Date" style={{ marginBottom: 8 }}>
                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="Date (optional)" />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" size="small" onClick={handleAddPayment}>
              Save
            </Button>
            <Button size="small" onClick={() => {
              form.resetFields(['new_payment_category', 'new_payment_amount', 'new_payment_source', 'new_payment_date']);
              setIsAddingPayment(false);
            }}>
              Cancel
            </Button>
          </Space>
        </div>
      )}

      {!isAddingPayment && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsAddingPayment(true)}
          style={{ width: '100%' }}
        >
          Add Payment
        </Button>
      )}
    </Modal>
  );
};

export default RenewLeaseModal;
