import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Skeleton,
  Alert,
  Tabs,
  Table,
  Form,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  message,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  BankOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProperty, useUpdateProperty, usePropertyUnits, usePropertyStats, useDeletePropertyUnit, useRegions, useDistricts, useWards } from '../hooks/useProperties';
import AddUnitModal from '../components/forms/AddUnitModal';
import EditUnitModal from '../components/forms/EditUnitModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Unit {
  id: string;
  unit_name: string;
  rent_per_month: number;
  property: string;
  is_occupied: boolean;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // Fetch data using TanStack Query hooks
  const { data: property, isLoading, error } = useProperty(id || '');
  const { data: unitsData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = usePropertyUnits({ property: id || '' });
  const { data: stats } = usePropertyStats(id || '');
  const updatePropertyMutation = useUpdateProperty();
  const deleteUnitMutation = useDeletePropertyUnit();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion || '');
  const { data: wards, isLoading: wardsLoading } = useWards(selectedDistrict || '');

  const units = unitsData?.items || [];

  // Debug logging
  useEffect(() => {
    if (unitsData) {
      console.log('Units Data:', unitsData);
      console.log('Units Items:', units);
    }
    if (unitsError) {
      console.error('Units Error:', unitsError);
    }
  }, [unitsData, units, unitsError]);

  // Update form when property data loads
  useEffect(() => {
    if (property) {
      // Map old property types to new valid options
      let propertyType = property.property_type;
      if (propertyType === 'Residential') {
        propertyType = 'Standalone';
      }
      
      form.setFieldsValue({
        property_name: property.property_name,
        property_type: propertyType,
        region: property.address?.region_code,
        district: property.address?.district_code,
        ward: property.address?.ward_code,
        street: property.address?.street,
      });
      // Set selected region and district for cascading dropdowns
      if (property.address?.region_code) {
        setSelectedRegion(property.address.region_code);
      }
      if (property.address?.district_code) {
        setSelectedDistrict(property.address.district_code);
      }
    }
  }, [property, form]);

  const handleBack = () => {
    navigate('/properties');
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to original values
    if (property) {
      // Map old property types to new valid options
      let propertyType = property.property_type;
      if (propertyType === 'Residential') {
        propertyType = 'Standalone';
      }
      
      form.setFieldsValue({
        property_name: property.property_name,
        property_type: propertyType,
        region: property.address?.region_code,
        district: property.address?.district_code,
        ward: property.address?.ward_code,
        street: property.address?.street,
      });
      // Reset cascading states
      if (property.address?.region_code) {
        setSelectedRegion(property.address.region_code);
      }
      if (property.address?.district_code) {
        setSelectedDistrict(property.address.district_code);
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values before save:', values);
      await updatePropertyMutation.mutateAsync({
        propertyId: id!,
        propertyData: values,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
      // Error already handled by mutation or validation
    }
  };

  const handleUnitAdded = () => {
    // The mutation will auto-refresh the units list
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setShowEditUnitModal(true);
  };

  const handleUnitUpdated = () => {
    refetchUnits();
  };

  const handleDeleteUnit = (unit: Unit) => {
    Modal.confirm({
      title: 'Delete Unit',
      content: `Are you sure you want to delete "${unit.unit_name}" (TSh ${unit.rent_per_month.toLocaleString()}/month)?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteUnitMutation.mutateAsync(unit.id);
          refetchUnits();
        } catch (error) {
          // Error already handled by mutation
        }
      },
    });
  };

  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedDistrict(undefined);
    form.setFieldsValue({
      district: undefined,
      ward: undefined,
    });
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    form.setFieldsValue({ ward: undefined });
  };

  const getPropertyTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      Apartment: 'blue',
      Standalone: 'green',
      'Commercial building': 'orange',
      Residential: 'purple',
    };
    return <Tag color={colors[type] || 'default'}>{type}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      available: 'success',
      occupied: 'processing',
      maintenance: 'warning',
      unavailable: 'error',
    };
    return <Tag color={colors[status?.toLowerCase()] || 'default'}>{status}</Tag>;
  };

  // Units table columns
  const unitsColumns: ColumnsType<Unit> = [
    {
      title: 'Unit Name',
      dataIndex: 'unit_name',
      key: 'unit_name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Rent Per Month',
      dataIndex: 'rent_per_month',
      key: 'rent_per_month',
      render: (amount) => `TSh ${amount?.toLocaleString() || 0}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_occupied',
      key: 'is_occupied',
      render: (isOccupied) => (
        <Tag color={isOccupied ? 'error' : 'success'}>
          {isOccupied ? 'Occupied' : 'Available'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditUnit(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUnit(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton.Button active style={{ marginBottom: 16 }} />
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
          </Col>
        </Row>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          Back to Properties
        </Button>
        <Alert
          message="Error"
          description="Failed to load property details. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Back
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <BankOutlined /> {property.property_name}
            </Title>
          </Space>
          <Space>
            {!isEditMode ? (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Edit Property
              </Button>
            ) : (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={updatePropertyMutation.isPending}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Units"
                value={stats.total_units || property.units_count || 0}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Occupied Units"
                value={stats.occupied_units || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Available Units"
                value={stats.available_units || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.total_revenue || 0}
                prefix="TZS"
                precision={0}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'details',
              label: 'Property Details',
              children: (
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Property Name"
                        name="property_name"
                        rules={[{ required: true, message: 'Please enter property name' }]}
                      >
                        <Input
                          placeholder="Enter property name"
                          disabled={!isEditMode}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Property Type"
                        name="property_type"
                        rules={[{ required: true, message: 'Please select property type' }]}
                      >
                        <Select
                          placeholder="Select property type"
                          disabled={!isEditMode}
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
                      {!isEditMode ? (
                        <Form.Item label="Region">
                          <Input
                            value={property.address?.region_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          label="Region"
                          name="region"
                          rules={[{ required: true, message: 'Please select region' }]}
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
                      )}
                    </Col>
                    <Col xs={24} sm={12}>
                      {!isEditMode ? (
                        <Form.Item label="District">
                          <Input
                            value={property.address?.district_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          label="District"
                          name="district"
                          rules={[{ required: true, message: 'Please select district' }]}
                        >
                          <Select
                            placeholder="Select District"
                            disabled={!districts || districts.length === 0}
                            onChange={handleDistrictChange}
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
                      )}
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      {!isEditMode ? (
                        <Form.Item label="Ward">
                          <Input
                            value={property.address?.ward_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item label="Ward" name="ward">
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
                      )}
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Street"
                        name="street"
                        rules={[{ required: true, message: 'Please enter street address' }]}
                      >
                        <Input
                          placeholder="Enter street address"
                          disabled={!isEditMode}
                          prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Total Units">
                        <Input
                          value={property.units_count || 0}
                          disabled
                          addonAfter={<HomeOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            },
            {
              key: 'units',
              label: (
                <span>
                  <HomeOutlined /> Units ({units.length})
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowAddUnitModal(true)}
                    >
                      Add Unit
                    </Button>
                  </div>
                  {unitsLoading ? (
                    <div>
                      <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 16 }} />
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  ) : unitsError ? (
                    <Alert
                      message="Error Loading Units"
                      description="Failed to load property units. Please try again."
                      type="error"
                      showIcon
                    />
                  ) : units.length === 0 ? (
                    <Alert
                      message="No Units Found"
                      description="This property has no units yet. Click 'Add Unit' to create one."
                      type="info"
                      showIcon
                    />
                  ) : (
                    <Table
                      columns={unitsColumns}
                      dataSource={units}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        propertyId={id || ''}
        onUnitAdded={handleUnitAdded}
      />
      {/* Edit Unit Modal */}
      <EditUnitModal
        isOpen={showEditUnitModal}
        onClose={() => {
          setShowEditUnitModal(false);
          setSelectedUnit(null);
        }}
        unit={selectedUnit}
        onUnitUpdated={handleUnitUpdated}
      />
    </div>
  );
};

export default PropertyDetail;
