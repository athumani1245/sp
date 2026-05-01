import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, message, Spin } from 'antd';
import { BankOutlined, InfoCircleOutlined, EnvironmentOutlined, IdcardOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRegions, useDistricts, useWards, useAddProperty } from '../../hooks/useProperties';
import { usePropertyManagers } from '../../hooks/usePropertyManagers';

interface Region {
  region_code: string;
  region_name: string;
}

interface District {
  district_code: string;
  district_name: string;
}

interface Ward {
  ward_code: string;
  ward_name: string;
}

interface PropertyManager {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: (data?: any) => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyAdded,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // Use TanStack Query hooks
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion || '');
  const { data: wards, isLoading: wardsLoading } = useWards(selectedDistrict || '');
  const { data: managersData, isLoading: managersLoading } = usePropertyManagers({ limit: 100 });
  const addPropertyMutation = useAddProperty();

  const managersList = Array.isArray(managersData?.items) ? managersData?.items : [];

  const locationLoading = regionsLoading || districtsLoading || wardsLoading;

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDistrict(undefined);
    form.setFieldsValue({
      district: undefined,
      ward: undefined,
    });
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    form.setFieldsValue({ ward: undefined });
  };

  const handleSubmit = async (values: any) => {
    try {
      await addPropertyMutation.mutateAsync(values);
      form.resetFields();
      setSelectedRegion(undefined);
      setSelectedDistrict(undefined);
      onPropertyAdded();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedRegion(undefined);
    setSelectedDistrict(undefined);
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <BankOutlined style={{ color: '#CC5B4B', marginRight: 8 }} />
          {t('properties:addPropertyModal.title')}
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addPropertyMutation.isPending}
      okText={t('properties:addPropertyModal.addProperty')}
      cancelText={t('properties:addPropertyModal.cancel')}
      width={800}
      okButtonProps={{
        style: { backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' },
      }}
    >
      <Spin spinning={locationLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            propertyType: 'Apartment',
          }}
        >
          {/* Basic Information Section */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#CC5B4B',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '8px',
            }}
          >
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            {t('properties:addPropertyModal.basicInformation')}
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.propertyName')}
                name="propertyName"
                rules={[{ required: true, message: t('properties:addPropertyModal.propertyNameRequired') }]}
                tooltip={t('properties:addPropertyModal.propertyNameTooltip')}
              >
                <Input placeholder={t('properties:addPropertyModal.propertyNamePlaceholder')} prefix={<BankOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.propertyType')}
                name="propertyType"
                tooltip={t('properties:addPropertyModal.propertyTypeTooltip')}
              >
                <Select
                  placeholder={t('properties:addPropertyModal.propertyTypePlaceholder')}
                  options={[
                    { value: 'Standalone', label: 'Standalone' },
                    { value: 'Apartment', label: 'Apartment' },
                    { value: 'Commercial building', label: 'Commercial building' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.propertyManager')}
                name="manager_id"
                tooltip={t('properties:addPropertyModal.propertyManagerTooltip')}
              >
                <Select
                  placeholder={t('properties:addPropertyModal.propertyManagerPlaceholder')}
                  allowClear
                  showSearch
                  loading={managersLoading}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={(managersList || []).map((mgr: any) => ({
                    value: mgr.id,
                    label: `${mgr.first_name} ${mgr.last_name} (${mgr.username})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Location Information Section */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginTop: '24px',
              marginBottom: '16px',
              color: '#CC5B4B',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '8px',
            }}
          >
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            {t('properties:addPropertyModal.locationInformation')}
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.region')}
                name="region"
                rules={[{ required: true, message: t('properties:addPropertyModal.regionRequired') }]}
                tooltip={t('properties:addPropertyModal.regionTooltip')}
              >
                <Select
                  placeholder={t('properties:addPropertyModal.regionPlaceholder')}
                  onChange={handleRegionChange}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={regions?.map((region: any) => ({
                    value: region.region_code,
                    label: region.region_name,
                  })) || []}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.district')}
                name="district"
                rules={[{ required: true, message: t('properties:addPropertyModal.districtRequired') }]}
                tooltip={t('properties:addPropertyModal.districtTooltip')}
              >
                <Select
                  placeholder={t('properties:addPropertyModal.districtPlaceholder')}
                  onChange={handleDistrictChange}
                  disabled={!districts || districts.length === 0}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    form.getFieldValue('region')
                      ? t('properties:addPropertyModal.noDistrictsAvailable')
                      : t('properties:addPropertyModal.selectRegionFirst')
                  }
                  options={districts?.map((district: any) => ({
                    value: district.district_code,
                    label: district.district_name,
                  })) || []}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.ward')}
                name="ward"
                tooltip={t('properties:addPropertyModal.wardTooltip')}
              >
                <Select
                  placeholder={t('properties:addPropertyModal.wardPlaceholder')}
                  disabled={!wards || wards.length === 0}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    form.getFieldValue('district')
                      ? t('properties:addPropertyModal.noWardsAvailable')
                      : t('properties:addPropertyModal.selectDistrictFirst')
                  }
                  options={wards?.map((ward: any) => ({
                    value: ward.ward_code,
                    label: ward.ward_name,
                  })) || []}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={t('properties:addPropertyModal.streetAddress')}
                name="street"
                rules={[{ required: true, message: t('properties:addPropertyModal.streetAddressRequired') }]}
                tooltip={t('properties:addPropertyModal.streetAddressTooltip')}
              >
                <Input placeholder={t('properties:addPropertyModal.streetAddressPlaceholder')} prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddPropertyModal;
