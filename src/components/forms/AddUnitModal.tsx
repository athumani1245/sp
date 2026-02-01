import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useAddPropertyUnit } from '../../hooks/useProperties';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onUnitAdded: () => void;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onUnitAdded,
}) => {
  const [form] = Form.useForm();
  const addUnitMutation = useAddPropertyUnit();

  const handleSubmit = async (values: any) => {
    try {
      const unitData = {
        property: propertyId,
        unit_name: values.unit_name,
        rent_per_month: values.rent_per_month,
      };

      await addUnitMutation.mutateAsync(unitData);
      form.resetFields();
      onUnitAdded();
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
          <HomeOutlined /> Add New Unit
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addUnitMutation.isPending}
      okText="Add Unit"
      cancelText="Cancel"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="Unit Name"
          name="unit_name"
          rules={[
            { required: true, message: 'Please enter unit name' },
            { min: 2, message: 'Unit name must be at least 2 characters' },
          ]}
        >
          <Input
            placeholder="e.g., Master Bedroom, Apartment 2A, Studio Room"
            prefix={<HomeOutlined />}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Rent Per Month"
          name="rent_per_month"
          rules={[
            { required: true, message: 'Please enter rent amount' },
            { type: 'number', min: 0, message: 'Rent must be a positive number' },
          ]}
        >
          <InputNumber
            placeholder="Enter monthly rent amount"
            style={{ width: '100%' }}
            size="large"
            min={0}
            formatter={(value) => `TSh ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/TSh\s?|(,*)/g, '') || 0) as any}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUnitModal;
