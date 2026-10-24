import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Row, Col, theme } from 'antd';
import { WalletOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAllProperties, useUnitChoices } from '../../hooks/useProperties';
import { useAddExpense, useUpdateExpense } from '../../hooks/useExpenses';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';
import { Expense } from '../../services/expenseService';
import { parseLeaseDate } from '../../utils/leaseDate';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: () => void;
  expense?: Expense | null;
}

interface Choice {
  id: string;
  names: string[];
}

// The expenses list returns properties, units and category as display names, so
// map them back onto the ids the selects (and the API) work with.
const resolveIds = (values: string[] | undefined, choices: Choice[]): string[] => {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => {
      const key = String(value ?? '').trim();
      if (!key) return '';
      const byId = choices.find((choice) => choice.id === key);
      if (byId) return byId.id;
      const byName = choices.find((choice) =>
        choice.names.some((name) => name.toLowerCase() === key.toLowerCase())
      );
      return byName?.id ?? '';
    })
    .filter(Boolean);
};

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onExpenseSaved,
  expense,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const isEditing = Boolean(expense);

  const { data: propertiesData, isLoading: propertiesLoading } = useAllProperties();
  const properties = propertiesData || [];

  const { data: unitChoices, isLoading: unitsLoading } = useUnitChoices();
  const availableUnits = unitChoices || [];

  const { data: categoriesData } = useExpenseCategories();
  const categories = categoriesData || [];

  const addExpenseMutation = useAddExpense();
  const updateExpenseMutation = useUpdateExpense();

  const unitLabel = (unit: { unit_name?: string; unit_number?: string; property_name?: string }) =>
    [unit.unit_name || unit.unit_number || t('expenses:expenseModal.unknownUnit'), unit.property_name]
      .filter(Boolean)
      .join(' - ');

  useEffect(() => {
    if (!isOpen) return;

    if (!expense) {
      form.resetFields();
      return;
    }

    const propertyChoices: Choice[] = properties.map((property: any) => ({
      id: property.id,
      names: [property.property_name].filter(Boolean),
    }));
    const unitChoiceList: Choice[] = availableUnits.map((unit) => ({
      id: unit.id,
      names: [unit.unit_name, unit.unit_number, unitLabel(unit)].filter(Boolean) as string[],
    }));
    const categoryChoices: Choice[] = categories.map((category) => ({
      id: category.id,
      names: [category.name].filter(Boolean),
    }));

    form.setFieldsValue({
      properties: resolveIds(expense.properties, propertyChoices),
      units: resolveIds(expense.units, unitChoiceList),
      category: expense.category ? resolveIds([expense.category], categoryChoices)[0] ?? null : null,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
      date: parseLeaseDate(expense.date) ?? dayjs(),
      description: expense.description || '',
    });
    // Depend on the choice list sizes rather than their identities so a background
    // refetch never discards edits the user has already made in the open form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, expense, properties.length, availableUnits.length, categories.length, form]);

  const handleSubmit = async (values: any) => {
    const expenseData = {
      properties: values.properties,
      units: values.units || [],
      category: values.category || null,
      description: values.description || '',
      amount: values.amount,
      date: values.date.format('DD-MM-YYYY'),
    };

    try {
      if (expense) {
        await updateExpenseMutation.mutateAsync({ expenseId: expense.id, expenseData });
      } else {
        await addExpenseMutation.mutateAsync(expenseData);
      }
      form.resetFields();
      onExpenseSaved();
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
          {isEditing ? t('expenses:expenseModal.editTitle') : t('expenses:expenseModal.title')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addExpenseMutation.isPending || updateExpenseMutation.isPending}
      okText={isEditing ? t('expenses:expenseModal.update') : t('expenses:expenseModal.save')}
      cancelText={t('expenses:expenseModal.cancel')}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:expenseModal.property')}
              name="properties"
              rules={[{ required: true, message: t('expenses:expenseModal.propertyRequired') }]}
            >
              <Select
                mode="multiple"
                placeholder={t('expenses:expenseModal.selectProperty')}
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
              label={t('expenses:expenseModal.unit')}
              name="units"
              tooltip={t('expenses:expenseModal.unitTooltip')}
            >
              <Select
                mode="multiple"
                placeholder={t('expenses:expenseModal.selectUnit')}
                loading={unitsLoading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableUnits.map((unit) => ({
                  value: unit.id,
                  label: unitLabel(unit),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label={t('expenses:expenseModal.category')} name="category">
              <Select
                placeholder={t('expenses:expenseModal.selectCategory')}
                allowClear
                suffixIcon={<TagOutlined />}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:expenseModal.amount')}
              name="amount"
              rules={[
                { required: true, message: t('expenses:expenseModal.amountRequired') },
                { type: 'number', min: 1, message: t('expenses:expenseModal.amountMustBePositive') },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder={t('expenses:expenseModal.amountPlaceholder')}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0) as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t('expenses:expenseModal.date')}
              name="date"
              initialValue={dayjs()}
              rules={[{ required: true, message: t('expenses:expenseModal.dateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" suffixIcon={<CalendarOutlined />} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label={t('expenses:expenseModal.description')} name="description">
              <Input placeholder={t('expenses:expenseModal.descriptionPlaceholder')} maxLength={200} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ExpenseFormModal;
