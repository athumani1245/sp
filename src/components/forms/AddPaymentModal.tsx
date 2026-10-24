import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Row, Col } from 'antd';
import { DollarOutlined, CalendarOutlined, TagOutlined, WalletOutlined } from '@ant-design/icons';
import { useCreatePayment } from '../../hooks/usePayments';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          {t('leases:addPaymentModal.title')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={createPaymentMutation.isPending}
      okText={t('leases:addPaymentModal.recordPayment')}
      cancelText={t('leases:addPaymentModal.cancel')}
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
              label={t('leases:addPaymentModal.amount')}
              name="amount_paid"
              rules={[
                { required: true, message: t('leases:addPaymentModal.amountRequired') },
                { type: 'number', min: 1, message: t('leases:addPaymentModal.amountMustBePositive') },
              ]}
              tooltip={t('leases:addPaymentModal.amountTooltip')}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                prefix={<DollarOutlined />}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0) as any}
                placeholder={t('leases:addPaymentModal.amountPlaceholder')}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('leases:addPaymentModal.paymentDate')}
              name="date_paid"
              rules={[{ required: true, message: t('leases:addPaymentModal.paymentDateRequired') }]}
              tooltip={t('leases:addPaymentModal.paymentDateTooltip')}
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
              label={t('leases:addPaymentModal.category')}
              name="category"
              rules={[{ required: true, message: t('leases:addPaymentModal.categoryRequired') }]}
              tooltip={t('leases:addPaymentModal.categoryTooltip')}
            >
              <Select
                placeholder={t('leases:addPaymentModal.categoryPlaceholder')}
                suffixIcon={<TagOutlined />}
                options={[
                  { value: 'RENT', label: t('leases:addPaymentModal.rent') },
                  { value: 'WATER', label: t('leases:addPaymentModal.water') },
                  { value: 'ELECTRICITY', label: t('leases:addPaymentModal.electricity') },
                  { value: 'SERVICE_CHARGE', label: t('leases:addPaymentModal.serviceCharge') },
                  { value: 'Security Deposit', label: t('leases:addPaymentModal.securityDeposit') },
                  { value: 'OTHER', label: t('leases:addPaymentModal.other') },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('leases:addPaymentModal.paymentSource')}
              name="payment_source"
              rules={[{ required: true, message: t('leases:addPaymentModal.paymentSourceRequired') }]}
              tooltip={t('leases:addPaymentModal.paymentSourceTooltip')}
            >
              <Select
                placeholder={t('leases:addPaymentModal.paymentSourcePlaceholder')}
                suffixIcon={<WalletOutlined />}
                options={[
                  { value: 'CASH', label: t('leases:addPaymentModal.cash') },
                  { value: 'MB', label: t('leases:addPaymentModal.mobileMoney') },
                  { value: 'BANK', label: t('leases:addPaymentModal.bankTransfer') },
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
