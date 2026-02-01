import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, message, Spin } from 'antd';
import { BankOutlined, InfoCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRegions, useDistricts, useWards, useAddProperty } from '../../hooks/useProperties';

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
  const [form] = Form.useForm();
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // Use TanStack Query hooks
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion || '');
  const { data: wards, isLoading: wardsLoading } = useWards(selectedDistrict || '');
  const addPropertyMutation = useAddProperty();

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
          Add Property
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={addPropertyMutation.isPending}
      okText="Add Property"
      cancelText="Cancel"
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
            Basic Information
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Property Name"
                name="propertyName"
                rules={[{ required: true, message: 'Please enter property name' }]}
                tooltip="Give your property a unique, descriptive name (e.g., 'Sunset Apartments', 'Green Valley Plaza')"
              >
                <Input placeholder="Enter property name" prefix={<BankOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Property Type"
                name="propertyType"
                tooltip="Select the type of property you're adding"
              >
                <Select
                  placeholder="Select property type"
                  options={[
                    { value: 'Standalone', label: 'Standalone' },
                    { value: 'Apartment', label: 'Apartment' },
                    { value: 'Commercial building', label: 'Commercial building' },
                  ]}
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
            Location Information
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Region"
                name="region"
                rules={[{ required: true, message: 'Please select region' }]}
                tooltip="Select the administrative region where this property is located"
              >
                <Select
                  placeholder="Select Region"
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
                label="District"
                name="district"
                rules={[{ required: true, message: 'Please select district' }]}
                tooltip="Select the district within the chosen region. Districts will load after selecting a region."
              >
                <Select
                  placeholder="Select District"
                  onChange={handleDistrictChange}
                  disabled={!districts || districts.length === 0}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    form.getFieldValue('region')
                      ? 'No districts available'
                      : 'Please select a region first'
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
                label="Ward"
                name="ward"
                tooltip="Optionally specify the ward/neighborhood for more precise location tracking"
              >
                <Select
                  placeholder="Select Ward"
                  disabled={!wards || wards.length === 0}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    form.getFieldValue('district')
                      ? 'No wards available'
                      : 'Please select a district first'
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
                label="Street Address"
                name="street"
                rules={[{ required: true, message: 'Please enter street address' }]}
                tooltip="Enter the complete street address including building/plot number (e.g., '123 Beach Road', 'Plot 456 Nyerere St')"
              >
                <Input placeholder="e.g., 123 Beach Road" prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddPropertyModal;
