import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Row, Col } from 'antd';
import { DollarOutlined, CalendarOutlined, TagOutlined, WalletOutlined } from '@ant-design/icons';
import { useCreatePayment } from '../../hooks/usePayments';
import dayjs from 'dayjs';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaseId: string;
  onPaymentAdded?: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  leaseId,
  onPaymentAdded,
}) => {
  const [form] = Form.useForm();
  const createPaymentMutation = useCreatePayment();

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        date_paid: dayjs(),
        category: 'RENT',
        payment_source: 'CASH',
      });
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: any) => {
    try {
      const paymentData = {
        lease: leaseId,
        amount_paid: values.amount_paid,
        date_paid: values.date_paid.format('YYYY-MM-DD'),
        category: values.category,
        payment_source: values.payment_source,
      };

      await createPaymentMutation.mutateAsync(paymentData);
      
      form.resetFields();
      if (onPaymentAdded) {
        onPaymentAdded();
      }
      onClose();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <DollarOutlined style={{ color: '#CC5B4B', marginRight: 8 }} />
          Record Payment
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={createPaymentMutation.isPending}
      okText="Record Payment"
      cancelText="Cancel"
      width={600}
      okButtonProps={{
        style: { backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Amount (TSh)"
              name="amount_paid"
              rules={[
                { required: true, message: 'Please enter the payment amount' },
                { type: 'number', min: 1, message: 'Amount must be greater than 0' },
              ]}
              tooltip="Enter the amount paid by the tenant"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                prefix={<DollarOutlined />}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0) as any}
                placeholder="0"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Payment Date"
              name="date_paid"
              rules={[{ required: true, message: 'Please select payment date' }]}
              tooltip="Date when the payment was received"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select category' }]}
              tooltip="Type of payment being recorded"
            >
              <Select
                placeholder="Select Category"
                suffixIcon={<TagOutlined />}
                options={[
                  { value: 'RENT', label: 'Rent' },
                  { value: 'WATER', label: 'Water' },
                  { value: 'ELECTRICITY', label: 'Electricity' },
                  { value: 'SERVICE_CHARGE', label: 'Service Charge' },
                  { value: 'Security Deposit', label: 'Security Deposit' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Payment Source"
              name="payment_source"
              rules={[{ required: true, message: 'Please select payment source' }]}
              tooltip="Method used for payment"
            >
              <Select
                placeholder="Select Payment Source"
                suffixIcon={<WalletOutlined />}
                options={[
                  { value: 'CASH', label: 'Cash' },
                  { value: 'MB', label: 'Mobile Money' },
                  { value: 'BANK', label: 'Bank Transfer' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddPaymentModal;
