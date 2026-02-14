import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Input, InputNumber, Space, Typography, Alert, Row, Col } from 'antd';
import { ExclamationCircleOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { useTerminateLease } from '../../hooks/useLeases';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface TerminateLeaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  lease: {
    id: string;
    lease_number: string;
    tenant?: {
      first_name?: string;
      last_name?: string;
    };
    property?: {
      property_name?: string;
    };
    unit?: {
      unit_name?: string;
      unit_number?: string;
    };
    start_date: string;
    end_date: string;
    remaining_amount?: number;
    total_amount?: number;
    number_of_month?: number;
  };
}

const TerminateLeaseModal: React.FC<TerminateLeaseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  lease,
}) => {
  const [form] = Form.useForm();
  const terminateLeaseMutation = useTerminateLease();
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [selectedTerminationDate, setSelectedTerminationDate] = useState<dayjs.Dayjs | null>(null);

  // Calculate consumed amount when termination date changes
  useEffect(() => {
    if (selectedTerminationDate && lease.total_amount && lease.start_date && lease.end_date) {
      calculateConsumedAmount(selectedTerminationDate);
    }
  }, [selectedTerminationDate, lease]);

  const calculateConsumedAmount = (terminationDate: dayjs.Dayjs) => {
    const startDate = dayjs(lease.start_date, 'DD-MM-YYYY');
    const endDate = dayjs(lease.end_date, 'DD-MM-YYYY');
    
    // Calculate total lease days
    const totalLeaseDays = endDate.diff(startDate, 'day');
    
    // Calculate days consumed (from start to termination)
    const daysConsumed = terminationDate.diff(startDate, 'day');
    
    // Calculate consumed amount proportionally
    const totalAmount = lease.total_amount || 0;
    const consumed = (daysConsumed / totalLeaseDays) * totalAmount;
    
    // Round to 2 decimal places
    const adjustmentAmount = Math.round(consumed * 100) / 100;
    setCalculatedAmount(adjustmentAmount);
    
    // Set the calculated amount in the form
    form.setFieldsValue({ adjustment_amount: adjustmentAmount });
  };

  const handleTerminationDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedTerminationDate(date);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await terminateLeaseMutation.mutateAsync({
        leaseId: lease.id,
        terminationData: {
          termination_date: values.termination_date.format('YYYY-MM-DD'),
          reason: values.reason || '',
          adjustment_amount: values.adjustment_amount || 0,
        },
      });

      form.resetFields();
      setCalculatedAmount(0);
      setSelectedTerminationDate(null);
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Termination failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCalculatedAmount(0);
    setSelectedTerminationDate(null);
    onCancel();
  };

  const getTenantName = () => {
    if (lease.tenant?.first_name && lease.tenant?.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return 'Unknown Tenant';
  };

  const getUnitInfo = () => {
    if (lease.unit?.unit_name) return lease.unit.unit_name;
    if (lease.unit?.unit_number) return `Unit ${lease.unit.unit_number}`;
    return 'Unknown Unit';
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Terminate Lease</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Terminate Lease"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        loading: terminateLeaseMutation.isPending,
      }}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message="Warning"
          description="Terminating a lease will mark it as terminated and calculate the consumed rent amount based on the termination date. This action cannot be undone."
          type="warning"
          showIcon
        />

        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text strong>Lease Number:</Text> <Text>{lease.lease_number}</Text>
            </div>
            <div>
              <Text strong>Tenant:</Text> <Text>{getTenantName()}</Text>
            </div>
            <div>
              <Text strong>Property:</Text> <Text>{lease.property?.property_name || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Unit:</Text> <Text>{getUnitInfo()}</Text>
            </div>
            {lease.total_amount && lease.total_amount > 0 && (
              <div>
                <Text strong>Total Lease Amount:</Text>{' '}
                <Text>TSh {lease.total_amount.toLocaleString()}</Text>
              </div>
            )}
            {lease.remaining_amount && lease.remaining_amount > 0 && (
              <div>
                <Text strong>Remaining Amount:</Text>{' '}
                <Text type="danger">TSh {lease.remaining_amount.toLocaleString()}</Text>
              </div>
            )}
            {lease.number_of_month && (
              <div>
                <Text strong>Lease Duration:</Text>{' '}
                <Text>{lease.number_of_month} month(s)</Text>
              </div>
            )}
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Termination Date"
                name="termination_date"
                rules={[
                  { required: true, message: 'Please select termination date' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      
                      const startDate = dayjs(lease.start_date, 'DD-MM-YYYY');
                      const endDate = dayjs(lease.end_date, 'DD-MM-YYYY');
                      const terminationDate = dayjs(value);

                      if (terminationDate.isBefore(startDate, 'day')) {
                        return Promise.reject('Termination date cannot be before lease start date');
                      }

                      if (terminationDate.isAfter(endDate, 'day')) {
                        return Promise.reject('Termination date cannot be after lease end date');
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Select termination date"
                  format="DD-MM-YYYY"
                  onChange={handleTerminationDateChange}
                  disabledDate={(current) => {
                    // Disable dates before lease start or after lease end
                    const startDate = dayjs(lease.start_date, 'DD-MM-YYYY');
                    const endDate = dayjs(lease.end_date, 'DD-MM-YYYY');
                    return current && (current.isBefore(startDate, 'day') || current.isAfter(endDate, 'day'));
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={<span><DollarOutlined /> Adjustment Amount</span>}
                name="adjustment_amount"
                rules={[
                  { required: true, message: 'Please enter adjustment amount' },
                  {
                    validator: (_, value) => {
                      if (value < 0) {
                        return Promise.reject('Amount cannot be negative');
                      }
                      if (lease.total_amount && value > lease.total_amount) {
                        return Promise.reject('Amount cannot exceed total lease amount');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                tooltip="This amount represents the rent consumed by the tenant up to the termination date. It's automatically calculated based on the termination date, but you can adjust it manually if needed."
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter adjustment amount"
                  prefix="TSh"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  min={0}
                  max={lease.total_amount || undefined}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          {calculatedAmount > 0 && (
            <Alert
              message="Calculated Rent Consumed"
              description={
                <span>
                  Based on the termination date, the tenant has consumed approximately{' '}
                  <Text strong>TSh {calculatedAmount.toLocaleString()}</Text> of the total lease amount.
                  You can adjust this amount if needed.
                </span>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Reason for Termination"
            name="reason"
            rules={[{ required: true, message: 'Please provide a reason for termination' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the reason for terminating this lease..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default TerminateLeaseModal;
