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
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAllProperties, usePropertyUnits } from '../../hooks/useProperties';
import { useAllTenants } from '../../hooks/useTenants';
import { useCreateLease } from '../../hooks/useLeases';

const { Text } = Typography;
const { Option } = Select;

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface Property {
  id: string;
  property_name: string;
}

interface Unit {
  id: string;
  unit_name: string;
  unit_number?: string;
  rent_per_month: number;
  rent_amount?: number;
  is_occupied: boolean;
}

interface Payment {
  id: string;
  payment_date: string;
  category: string;
  payment_source: string;
  amount_paid: number;
}

interface FormData {
  property_id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  number_of_month: number;
  rent_amount_per_unit: number;
  total_amount: number;
  discount: number;
  payments: Payment[];
}

interface AddLeaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const PAYMENT_CATEGORIES = [
  { value: 'WATER', label: 'Water' },
  { value: 'RENT', label: 'Rent' },
  { value: 'Security Deposit', label: 'Security Deposit' },
  { value: 'SERVICE_CHARGE', label: 'Service Charge' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_SOURCES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MB', label: 'Mobile Money' },
  { value: 'BANK', label: 'Bank Transfer' },
];

const AddLeaseModal: React.FC<AddLeaseModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // TanStack Query mutations
  const createLeaseMutation = useCreateLease();

  // Fetch properties, tenants, and units using TanStack Query (without pagination to get all)
  const { data: propertiesData, isLoading: propertiesLoading } = useAllProperties();
  const { data: tenantsData, isLoading: tenantsLoading } = useAllTenants();
  const { data: unitsData, isLoading: unitsLoading } = usePropertyUnits({ 
    property: selectedPropertyId,
  });

  const properties = propertiesData || [];
  const tenants = tenantsData || [];
  const availableUnits = unitsData?.items || [];

  // Debug logging
  useEffect(() => {
    console.log('Properties data:', propertiesData);
    console.log('Properties count:', properties.length);
    console.log('Tenants data:', tenantsData);
    console.log('Tenants count:', tenants.length);
    console.log('Selected property ID:', selectedPropertyId);
    console.log('Units data:', unitsData);
    console.log('Units count:', availableUnits.length);
  }, [propertiesData, properties, tenantsData, tenants, selectedPropertyId, unitsData, availableUnits]);

  const [formData, setFormData] = useState<FormData>({
    property_id: '',
    unit_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    number_of_month: 0,
    rent_amount_per_unit: 0,
    total_amount: 0,
    discount: 0,
    payments: [],
  });

  const calculateEndDate = (startDate: string, months: number): string => {
    if (!startDate || !months) return '';
    return dayjs(startDate).add(months, 'month').format('YYYY-MM-DD');
  };

  const calculateTotalAmount = (rentAmount: number, months: number): number => {
    return rentAmount * months;
  };

  const handleFieldChange = (field: string, value: any) => {
    let updatedFormData = { ...formData, [field]: value };

    // Handle property selection - load units
    if (field === 'property_id') {
      setSelectedPropertyId(value);
      updatedFormData = {
        ...updatedFormData,
        unit_id: '',
        rent_amount_per_unit: 0,
        total_amount: 0,
      };
      form.setFieldsValue({
        unit_id: undefined,
        rent_amount_per_unit: 0,
        total_amount: 0,
      });
    }

    // Handle unit selection - set rent amount
    if (field === 'unit_id') {
      const selectedUnit = availableUnits.find((u: Unit) => u.id === value);
      if (selectedUnit) {
        const rentAmount = selectedUnit.rent_per_month || selectedUnit.rent_amount || 0;
        updatedFormData = {
          ...updatedFormData,
          rent_amount_per_unit: rentAmount,
          total_amount: calculateTotalAmount(
            rentAmount,
            updatedFormData.number_of_month
          ),
        };
        form.setFieldsValue({
          rent_amount_per_unit: rentAmount,
          total_amount: calculateTotalAmount(
            rentAmount,
            updatedFormData.number_of_month
          ),
        });
      }
    }

    // Handle start date change - calculate end date
    if (field === 'start_date') {
      const endDate = calculateEndDate(value, updatedFormData.number_of_month);
      updatedFormData = { ...updatedFormData, end_date: endDate };
      form.setFieldsValue({ end_date: endDate });
    }

    // Handle number of months change - calculate end date and total amount
    if (field === 'number_of_month') {
      const endDate = calculateEndDate(updatedFormData.start_date, value);
      const totalAmount = calculateTotalAmount(updatedFormData.rent_amount_per_unit, value);
      updatedFormData = {
        ...updatedFormData,
        end_date: endDate,
        total_amount: totalAmount,
      };
      form.setFieldsValue({
        end_date: endDate,
        total_amount: totalAmount,
      });
    }

    // Handle rent amount change - recalculate total
    if (field === 'rent_amount_per_unit') {
      const totalAmount = calculateTotalAmount(value, updatedFormData.number_of_month);
      updatedFormData = { ...updatedFormData, total_amount: totalAmount };
      form.setFieldsValue({ total_amount: totalAmount });
    }

    setFormData(updatedFormData);
  };

  const addPayment = (values: any) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      payment_date: values.payment_date,
      category: values.category,
      payment_source: values.payment_source,
      amount_paid: values.amount_paid,
    };

    setPayments([...payments, newPayment]);
    setIsAddingPayment(false);
    form.resetFields(['payment_date', 'category', 'payment_source', 'amount_paid']);
    message.success('Payment added successfully');
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
    message.success('Payment removed');
  };

  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) =>
        PAYMENT_CATEGORIES.find((c) => c.value === category)?.label || category,
    },
    {
      title: 'Source',
      dataIndex: 'payment_source',
      key: 'payment_source',
      render: (source: string) =>
        PAYMENT_SOURCES.find((s) => s.value === source)?.label || source,
    },
    {
      title: 'Amount (TSh)',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount: number) => amount.toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: Payment) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removePayment(record.id)}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Find selected tenant to extract first_name, last_name, phone
      const selectedTenant = tenants.find((t: any) => t.id === values.tenant_id);
      
      if (!selectedTenant) {
        message.error('Selected tenant not found');
        setLoading(false);
        return;
      }

      // Format dates properly - convert dayjs objects to YYYY-MM-DD strings
      const startDate = values.start_date ? dayjs(values.start_date).format('YYYY-MM-DD') : '';
      const endDate = values.end_date || formData.end_date;

      // Prepare lease data with all required fields
      const leaseData = {
        unit: values.unit_id,
        first_name: selectedTenant.first_name,
        last_name: selectedTenant.last_name,
        tenant_phone: selectedTenant.phone || selectedTenant.username || '',
        number_of_month: values.number_of_month,
        start_date: startDate,
        end_date: endDate,
        rent_amount_per_unit: values.rent_amount_per_unit,
        discount: values.discount || '0',
        amount_paid: values.amount_paid || '0',
        total_amount: values.total_amount || formData.total_amount,
        payments: payments.map((payment: Payment) => ({
          payment_date: dayjs(payment.payment_date).format('YYYY-MM-DD'),
          category: payment.category,
          payment_source: payment.payment_source,
          amount_paid: payment.amount_paid,
        })),
      };

      await createLeaseMutation.mutateAsync(leaseData);

      handleCancel();
      onSuccess();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormData({
      property_id: '',
      unit_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      number_of_month: 0,
      rent_amount_per_unit: 0,
      total_amount: 0,
      discount: 0,
      payments: [],
    });
    setPayments([]);
    setIsAddingPayment(false);
    onCancel();
  };

  return (
    <Modal
      title="Create New Lease"
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Create Lease
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" size="small">
        {/* Lease Information */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Property"
              name="property_id"
              rules={[{ required: true, message: 'Please select a property' }]}
            >
              <Select
                placeholder="Select property"
                onChange={(value) => handleFieldChange('property_id', value)}
                showSearch
                optionFilterProp="children"
              >
                {properties.map((property: Property) => (
                  <Option key={property.id} value={property.id}>
                    {property.property_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Unit"
              name="unit_id"
              rules={[{ required: true, message: 'Please select a unit' }]}
            >
              <Select
                placeholder="Select unit"
                onChange={(value) => handleFieldChange('unit_id', value)}
                disabled={!formData.property_id}
                showSearch
                optionFilterProp="children"
              >
                {availableUnits.map((unit: Unit) => (
                  <Option key={unit.id} value={unit.id}>
                    {unit.unit_name || unit.unit_number || 'Unknown Unit'} - TSh {(unit.rent_per_month || unit.rent_amount || 0).toLocaleString()}/month
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label="Tenant"
              name="tenant_id"
              rules={[{ required: true, message: 'Please select a tenant' }]}
            >
              <Select
                placeholder="Select tenant"
                onChange={(value) => handleFieldChange('tenant_id', value)}
                showSearch
                optionFilterProp="children"
              >
                {tenants.map((tenant: Tenant) => (
                  <Option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        {/* Lease Terms */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label="Start Date"
              name="start_date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                onChange={(date) =>
                  handleFieldChange('start_date', date ? date.format('YYYY-MM-DD') : '')
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Duration (Months)"
              name="number_of_month"
              rules={[
                { required: true, message: 'Required' },
                { type: 'number', min: 1, message: 'Must be at least 1' },
              ]}
            >
              <InputNumber
                placeholder="Months"
                min={1}
                style={{ width: '100%' }}
                onChange={(value) => handleFieldChange('number_of_month', value || 0)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="End Date">
              <Input
                disabled
                value={formData.end_date ? dayjs(formData.end_date).format('DD-MM-YYYY') : ''}
                placeholder="Auto-calculated"
              />
            </Form.Item>
            <Form.Item name="end_date" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Financial Information */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label="Monthly Rent (TSh)"
              name="rent_amount_per_unit"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="0"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value) => handleFieldChange('rent_amount_per_unit', value || 0)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Total Amount (TSh)" name="total_amount">
              <InputNumber
                placeholder="Auto-calculated"
                style={{ width: '100%' }}
                disabled
                value={formData.total_amount}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Discount (TSh)" name="discount" initialValue={0}>
              <InputNumber
                placeholder="0"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hidden amount_paid field */}
        <Form.Item name="amount_paid" initialValue={0} hidden>
          <InputNumber />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }}>Payments</Divider>

        {/* Payments */}
        <Table
          dataSource={payments}
          columns={paymentColumns}
          pagination={false}
          size="small"
          rowKey="id"
          style={{ marginBottom: 12 }}
        />

        {isAddingPayment && (
          <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, marginBottom: 12 }}>
            <Row gutter={8}>
              <Col span={6}>
                <Form.Item name="payment_date" style={{ marginBottom: 0 }}>
                  <DatePicker
                    placeholder="Date"
                    style={{ width: '100%' }}
                    size="small"
                    format="DD-MM-YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="category" style={{ marginBottom: 0 }}>
                  <Select placeholder="Category" size="small">
                    {PAYMENT_CATEGORIES.map((cat) => (
                      <Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="payment_source" style={{ marginBottom: 0 }}>
                  <Select placeholder="Source" size="small">
                    {PAYMENT_SOURCES.map((source) => (
                      <Option key={source.value} value={source.value}>
                        {source.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="amount_paid" style={{ marginBottom: 0 }}>
                  <InputNumber placeholder="Amount" style={{ width: '100%' }} size="small" min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Space style={{ marginTop: 8 }}>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  form
                    .validateFields(['payment_date', 'category', 'payment_source', 'amount_paid'])
                    .then((values) => {
                      if (
                        values.payment_date &&
                        values.category &&
                        values.payment_source &&
                        values.amount_paid
                      ) {
                        addPayment({
                          payment_date: values.payment_date.format('YYYY-MM-DD'),
                          category: values.category,
                          payment_source: values.payment_source,
                          amount_paid: values.amount_paid,
                        });
                      } else {
                        message.error('Please fill all payment fields');
                      }
                    });
                }}
              >
                Save
              </Button>
              <Button size="small" onClick={() => setIsAddingPayment(false)}>
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
            size="small"
            block
          >
            Add Payment
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default AddLeaseModal;
