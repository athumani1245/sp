import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const UnitFormFields: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        label={t('properties:unitModal.unitName')}
        name="unit_name"
        rules={[
          { required: true, message: t('properties:unitModal.unitNameRequired') },
          { min: 2, message: t('properties:unitModal.unitNameMin') },
        ]}
      >
        <Input
          placeholder={t('properties:unitModal.unitNamePlaceholder')}
          prefix={<HomeOutlined />}
        />
      </Form.Item>

      <Form.Item
        label={t('properties:unitModal.rentPerMonth')}
        name="rent_per_month"
        rules={[
          { required: true, message: t('properties:unitModal.rentPerMonthRequired') },
          { type: 'number', min: 0, message: t('properties:unitModal.rentPerMonthInvalid') },
        ]}
      >
        <InputNumber
          placeholder={t('properties:unitModal.rentPerMonthPlaceholder')}
          style={{ width: '100%' }}
          min={0}
          formatter={(value) => `TSh ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value?.replace(/TSh\s?|(,*)/g, '') || 0) as any}
        />
      </Form.Item>
    </>
  );
};

export default UnitFormFields;
