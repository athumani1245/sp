import React from 'react';
import { Modal, Form } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAddPropertyUnit } from '../../hooks/useProperties';
import UnitFormFields from './UnitFormFields';

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
  const { t } = useTranslation();
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
          <HomeOutlined /> {t('properties:unitModal.addTitle')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addUnitMutation.isPending}
      okText={t('properties:unitModal.addOkText')}
      cancelText={t('properties:unitModal.cancelText')}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <UnitFormFields />
      </Form>
    </Modal>
  );
};

export default AddUnitModal;
