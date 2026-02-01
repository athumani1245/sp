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
  Typography,
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

const { Text, Title } = Typography;
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
      // Calculate suggested renewal dates (after current lease ends)
      const currentEndDate = parseDate(lease.end_date);
      const suggestedStartDate = currentEndDate ? currentEndDate.add(1, 'day') : dayjs();
      const suggestedEndDate = suggestedStartDate.add(6, 'month');

      form.setFieldsValue({
        start_date: suggestedStartDate,
        end_date: suggestedEndDate,
        number_of_month: 6,
        rent_amount_per_unit: lease.rent_amount_per_unit || 0,
      });

      // Initialize with one RENT payment
      setPayments([{
        key: Date.now().toString(),
        category: 'RENT',
      }]);
    }
  }, [visible, lease, form]);

  const handleAddPayment = () => {
    const newPayment: Payment = {
      key: Date.now().toString(),
      category: '',
    };
    setPayments([...payments, newPayment]);
    setIsAddingPayment(false);
  };

  const handleRemovePayment = (key: string) => {
    setPayments(payments.filter(p => p.key !== key));
  };

  const handlePaymentChange = (key: string, field: keyof Payment, value: any) => {
    setPayments(payments.map(p => {
      if (p.key === key) {
        return { ...p, [field]: value };
      }
      return p;
    }));
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
      render: (value: string, record: Payment) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select category"
          value={value}
          onChange={(val) => handlePaymentChange(record.key, 'category', val)}
        >
          {PAYMENT_CATEGORIES.map(cat => (
            <Option key={cat.value} value={cat.value}>{cat.label}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (value: string, record: Payment) => (
        <Input
          type="number"
          placeholder="Amount (optional)"
          value={value}
          onChange={(e) => handlePaymentChange(record.key, 'amount_paid', e.target.value)}
        />
      ),
    },
    {
      title: 'Payment Source',
      dataIndex: 'payment_source',
      key: 'payment_source',
      render: (value: string, record: Payment) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Source (optional)"
          value={value}
          allowClear
          onChange={(val) => handlePaymentChange(record.key, 'payment_source', val)}
        >
          {PAYMENT_SOURCES.map(source => (
            <Option key={source.value} value={source.value}>{source.label}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (value: string, record: Payment) => (
        <DatePicker
          style={{ width: '100%' }}
          placeholder="Date (optional)"
          value={value ? dayjs(value) : null}
          format="DD-MM-YYYY"
          onChange={(date) => handlePaymentChange(record.key, 'payment_date', date)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
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
            <Form.Item label="Total Amount (Auto-calculated)">
              <Input
                value={`TSh ${calculateTotalAmount().toLocaleString()}`}
                disabled
                style={{ fontWeight: 'bold' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider>Initial Payments (Optional)</Divider>
      
      <Table
        dataSource={payments}
        columns={paymentColumns}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
        style={{ marginBottom: 16 }}
      />

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddPayment}
        style={{ width: '100%' }}
      >
        Add Payment
      </Button>
    </Modal>
  );
};

export default RenewLeaseModal;
