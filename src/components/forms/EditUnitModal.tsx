import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUpdatePropertyUnit } from '../../hooks/useProperties';
import UnitFormFields from './UnitFormFields';

interface Unit {
  id: string;
  unit_name: string;
  rent_per_month: number;
  property: string;
  is_occupied: boolean;
}

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
  onUnitUpdated: () => void;
}

const EditUnitModal: React.FC<EditUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  onUnitUpdated,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const updateUnitMutation = useUpdatePropertyUnit();

  useEffect(() => {
    if (unit) {
      form.setFieldsValue({
        unit_name: unit.unit_name,
        rent_per_month: unit.rent_per_month,
      });
    }
  }, [unit, form]);

  const handleSubmit = async (values: any) => {
    if (!unit) return;

    try {
      const unitData = {
        property: unit.property,
        unit_name: values.unit_name,
        rent_per_month: values.rent_per_month,
      };

      await updateUnitMutation.mutateAsync({
        unitId: unit.id,
        unitData,
      });

      form.resetFields();
      onUnitUpdated();
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
          <HomeOutlined /> {t('properties:unitModal.editTitle')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={updateUnitMutation.isPending}
      okText={t('properties:unitModal.editOkText')}
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

export default EditUnitModal;
