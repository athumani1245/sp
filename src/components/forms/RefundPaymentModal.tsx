import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Row, Col } from 'antd';
import { RollbackOutlined, CalendarOutlined, WalletOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useRefundPayment } from '../../hooks/useLeases';

interface RefundPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: { id: string; amount_paid: string | number } | null;
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const refundPaymentMutation = useRefundPayment();

  const maxAmount = parseFloat(payment?.amount_paid as string) || 0;
  const formatCurrency = (amount: number) => `TSh ${amount.toLocaleString()}`;

  useEffect(() => {
    if (isOpen && payment) {
      form.setFieldsValue({
        amount: parseFloat(payment.amount_paid as string) || 0,
        date: dayjs(),
        payment_source: 'CASH',
      });
    }
  }, [isOpen, payment, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: { amount: number; date: dayjs.Dayjs; payment_source: string }) => {
    if (!payment) return;
    try {
      await refundPaymentMutation.mutateAsync({
        paymentId: payment.id,
        amount: values.amount,
        date: values.date.format('DD-MM-YYYY'),
        payment_source: values.payment_source,
      });
      handleClose();
    } catch (error) {
      // Error already handled by the mutation
    }
  };

  return (
    <Modal
      title={
        <span>
          <RollbackOutlined style={{ color: '#CC5B4B', marginRight: 8 }} />
          {t('leases:refundPaymentModal.title')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={refundPaymentMutation.isPending}
      okText={t('leases:refundPaymentModal.submit')}
      cancelText={t('leases:refundPaymentModal.cancel')}
      width={480}
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
        <Form.Item
          label={t('leases:refundPaymentModal.amount')}
          name="amount"
          rules={[
            { required: true, message: t('leases:refundPaymentModal.amountRequired') },
            {
              validator: (_, value) => {
                if (value === null || value === undefined || value === '') {
                  return Promise.resolve();
                }
                if (typeof value !== 'number' || Number.isNaN(value)) {
                  return Promise.reject(new Error(t('leases:refundPaymentModal.amountInvalid')));
                }
                if (value <= 0) {
                  return Promise.reject(new Error(t('leases:refundPaymentModal.amountMustBePositive')));
                }
                if (Math.round(value * 100) !== value * 100) {
                  return Promise.reject(new Error(t('leases:refundPaymentModal.amountTooManyDecimals')));
                }
                if (value > maxAmount) {
                  return Promise.reject(new Error(
                    t('leases:refundPaymentModal.amountExceedsMax', { amount: formatCurrency(maxAmount) })
                  ));
                }
                return Promise.resolve();
              },
            },
          ]}
          tooltip={t('leases:refundPaymentModal.amountTooltip')}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            max={maxAmount}
            precision={2}
            step={1}
            controls
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/(,*)/g, '') || 0) as any}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t('leases:refundPaymentModal.date')}
              name="date"
              rules={[{ required: true, message: t('leases:refundPaymentModal.dateRequired') }]}
              tooltip={t('leases:refundPaymentModal.dateTooltip')}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('leases:refundPaymentModal.paymentSource')}
              name="payment_source"
              rules={[{ required: true, message: t('leases:refundPaymentModal.paymentSourceRequired') }]}
              tooltip={t('leases:refundPaymentModal.paymentSourceTooltip')}
            >
              <Select
                placeholder={t('leases:refundPaymentModal.paymentSourcePlaceholder')}
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

export default RefundPaymentModal;
