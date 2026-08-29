import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Row, Col, theme } from 'antd';
import { WalletOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAllProperties, useUnitChoices } from '../../hooks/useProperties';
import { useAddExpense } from '../../hooks/useExpenses';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onExpenseAdded }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const { data: propertiesData, isLoading: propertiesLoading } = useAllProperties();
  const properties = propertiesData || [];

  const { data: unitChoices, isLoading: unitsLoading } = useUnitChoices();
  const availableUnits = unitChoices || [];

  const { data: categories } = useExpenseCategories();

  const addExpenseMutation = useAddExpense();

  const handleSubmit = async (values: any) => {
    try {
      await addExpenseMutation.mutateAsync({
        properties: values.properties,
        units: values.units || [],
        category: values.category || null,
        description: values.description || '',
        amount: values.amount,
        date: values.date.format('DD-MM-YYYY'),
      });
      form.resetFields();
      onExpenseAdded();
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
          <WalletOutlined style={{ color: token.colorPrimary, marginRight: 8 }} />
          {t('expenses:addExpenseModal.title')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addExpenseMutation.isPending}
      okText={t('expenses:addExpenseModal.save')}
      cancelText={t('expenses:addExpenseModal.cancel')}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:addExpenseModal.property')}
              name="properties"
              rules={[{ required: true, message: t('expenses:addExpenseModal.propertyRequired') }]}
            >
              <Select
                mode="multiple"
                placeholder={t('expenses:addExpenseModal.selectProperty')}
                loading={propertiesLoading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={properties.map((property: any) => ({
                  value: property.id,
                  label: property.property_name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:addExpenseModal.unit')}
              name="units"
              tooltip={t('expenses:addExpenseModal.unitTooltip')}
            >
              <Select
                mode="multiple"
                placeholder={t('expenses:addExpenseModal.selectUnit')}
                loading={unitsLoading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableUnits.map((unit) => ({
                  value: unit.id,
                  label: [unit.unit_name || unit.unit_number || t('expenses:addExpenseModal.unknownUnit'), unit.property_name]
                    .filter(Boolean)
                    .join(' - '),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label={t('expenses:addExpenseModal.category')} name="category">
              <Select
                placeholder={t('expenses:addExpenseModal.selectCategory')}
                allowClear
                suffixIcon={<TagOutlined />}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:addExpenseModal.amount')}
              name="amount"
              rules={[
                { required: true, message: t('expenses:addExpenseModal.amountRequired') },
                { type: 'number', min: 1, message: t('expenses:addExpenseModal.amountMustBePositive') },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder={t('expenses:addExpenseModal.amountPlaceholder')}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0) as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:addExpenseModal.date')}
              name="date"
              initialValue={dayjs()}
              rules={[{ required: true, message: t('expenses:addExpenseModal.dateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" suffixIcon={<CalendarOutlined />} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label={t('expenses:addExpenseModal.description')} name="description">
              <Input placeholder={t('expenses:addExpenseModal.descriptionPlaceholder')} maxLength={200} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddExpenseModal;
