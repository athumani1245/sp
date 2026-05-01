import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  FileTextOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQueryClient } from '@tanstack/react-query';
import { useProperty, useUpdateProperty, useDeleteProperty, usePropertyUnits, useDeletePropertyUnit, useRegions, useDistricts, useWards } from '../hooks/useProperties';
import { usePropertyManagers } from '../hooks/usePropertyManagers';
import { useLeases, leaseKeys } from '../hooks/useLeases';
import { getLeases } from '../services/leaseService';
import AddUnitModal from '../components/forms/AddUnitModal';
import EditUnitModal from '../components/forms/EditUnitModal';
import Chatter from '../components/chatter/Chatter';
import ChatterLayout from '../components/layout/ChatterLayout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Unit {
  id: string;
  unit_name: string;
  rent_per_month: number;
  property: string;
  is_occupied: boolean;
}

// Sub-component for property manager field (view/edit)
const PropertyManagerField: React.FC<{ isEditMode: boolean; property: any }> = ({ isEditMode, property }) => {
  const { t } = useTranslation();
  const { data: managersData, isLoading: managersLoading } = usePropertyManagers({ limit: 100 });
  const managersList = Array.isArray(managersData?.items) ? managersData!.items : [];

  if (!isEditMode) {
    const manager = property.managers || property.manager;
    const managerName = manager
      ? `${manager.first_name} ${manager.last_name}`
      : property.manager_name || '-';
    return (
      <Form.Item label={t('properties:addPropertyModal.propertyManager')}>
        <Input value={managerName} disabled prefix={<UserOutlined />} />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      label={t('properties:addPropertyModal.propertyManager')}
      name="manager_id"
    >
      <Select
        placeholder={t('properties:addPropertyModal.propertyManagerPlaceholder')}
        allowClear
        showSearch
        loading={managersLoading}
        filterOption={(input, option) =>
          String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={managersList.map((mgr: any) => ({
          value: mgr.id,
          label: `${mgr.first_name} ${mgr.last_name} (${mgr.username})`,
        }))}
      />
    </Form.Item>
  );
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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
  
  // Fetch all leases without pagination for client-side filtering
  // Don't pass page/limit to get all leases
  const { data: leasesData, isLoading: leasesLoading, error: leasesError } = useLeases({});
  
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();
  const deleteUnitMutation = useDeletePropertyUnit();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: districts, isLoading: districtsLoading } = useDistricts(selectedRegion || '');
  const { data: wards, isLoading: wardsLoading } = useWards(selectedDistrict || '');

  const units = unitsData?.items || [];
  
  // Filter leases client-side based on property ID
  const leases = useMemo(() => {
    if (!leasesData?.items || !id) return [];
    return leasesData.items.filter((lease: any) => {
      // Match against property ID in lease.property.id
      const leasePropertyId = lease.property?.id;
      return leasePropertyId === id;
    });
  }, [leasesData, id]);

  // Prefetch leases when property loads
  useEffect(() => {
    if (id) {
      // Prefetch all leases for better performance (no pagination params = fetch all)
      queryClient.prefetchQuery({
        queryKey: leaseKeys.list({}),
        queryFn: () => getLeases({}),
        staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
      });
    }
  }, [id, queryClient]);

  // Debug logging
  useEffect(() => {
    if (unitsData) {
      console.log('Units Data:', unitsData);
      console.log('Units Items:', units);
    }
    if (unitsError) {
      console.error('Units Error:', unitsError);
    }
    if (leasesData) {
      console.log('All Leases:', leasesData.items?.length || 0);
      console.log('Filtered Leases for Property:', leases.length);
    }
  }, [unitsData, units, unitsError, leasesData, leases]);

  // Update form when property data loads
  useEffect(() => {
    if (property) {
      // Map old property types to new valid options
      let propertyType = property.property_type;
      if (propertyType === 'Residential') {
        propertyType = 'Standalone';
      }

      // Resolve region code from name if code is not available
      const regionCode = property.address?.region_code
        || (regions && property.address?.region_name
          ? regions.find((r: any) => r.region_name === property.address.region_name)?.region_code
          : undefined);

      form.setFieldsValue({
        property_name: property.property_name,
        property_type: propertyType,
        region: regionCode,
        street: property.address?.street,
        manager_id: property.managers?.id || property.manager?.id || property.manager_id || undefined,
      });
      // Set selected region for cascading dropdowns
      if (regionCode && regionCode !== selectedRegion) {
        setSelectedRegion(regionCode);
      }
    }
  }, [property, regions, form]);

  // Resolve district once districts are loaded
  useEffect(() => {
    if (property && districts && districts.length > 0) {
      const districtCode = property.address?.district_code
        || districts.find((d: any) => d.district_name === property.address?.district_name)?.district_code;

      if (districtCode) {
        form.setFieldsValue({ district: districtCode });
        if (districtCode !== selectedDistrict) {
          setSelectedDistrict(districtCode);
        }
      }
    }
  }, [property, districts, form]);

  // Resolve ward once wards are loaded
  useEffect(() => {
    if (property && wards && wards.length > 0) {
      const wardCode = property.address?.ward_code
        || wards.find((w: any) => w.ward_name === property.address?.ward_name)?.ward_code;

      if (wardCode) {
        form.setFieldsValue({ ward: wardCode });
      }
    }
  }, [property, wards, form]);

  const handleBack = () => {
    navigate('/properties');
  };

  const handleDeleteProperty = () => {
    Modal.confirm({
      title: t('properties:propertyDetail.deleteProperty'),
      content: t('properties:propertyDetail.deletePropertyConfirm', { propertyName: property?.property_name }),
      okText: t('properties:propertyDetail.delete'),
      okType: 'danger',
      cancelText: t('properties:propertyDetail.cancel'),
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      onOk: async () => {
        try {
          await deletePropertyMutation.mutateAsync(id!);
          navigate('/properties');
        } catch (error) {
          // Error already handled by mutation
        }
      },
    });
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to original values using currently resolved codes
    if (property) {
      let propertyType = property.property_type;
      if (propertyType === 'Residential') {
        propertyType = 'Standalone';
      }

      const regionCode = property.address?.region_code
        || (regions && property.address?.region_name
          ? regions.find((r: any) => r.region_name === property.address.region_name)?.region_code
          : undefined);
      const districtCode = property.address?.district_code
        || (districts && property.address?.district_name
          ? districts.find((d: any) => d.district_name === property.address.district_name)?.district_code
          : undefined);
      const wardCode = property.address?.ward_code
        || (wards && property.address?.ward_name
          ? wards.find((w: any) => w.ward_name === property.address.ward_name)?.ward_code
          : undefined);

      form.setFieldsValue({
        property_name: property.property_name,
        property_type: propertyType,
        region: regionCode,
        district: districtCode,
        ward: wardCode,
        street: property.address?.street,
        manager_id: property.managers?.id || property.manager?.id || property.manager_id || undefined,
      });
      if (regionCode) setSelectedRegion(regionCode);
      if (districtCode) setSelectedDistrict(districtCode);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updatePropertyMutation.mutateAsync({
        propertyId: id!,
        propertyData: values,
      });
      setIsEditMode(false);
    } catch (error) {
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
      title: t('properties:propertyDetail.deleteUnit'),
      content: t('properties:propertyDetail.deleteUnitConfirm', { 
        unitName: unit.unit_name, 
        rent: unit.rent_per_month.toLocaleString() 
      }),
      okText: t('properties:propertyDetail.delete'),
      okType: 'danger',
      cancelText: t('properties:propertyDetail.cancel'),
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

  const getLeaseStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; key: string }> = {
      active: { color: 'success', key: 'active' },
      draft: { color: 'default', key: 'draft' },
      expired: { color: 'error', key: 'expired' },
      terminated: { color: 'default', key: 'terminated' },
      cancelled: { color: 'warning', key: 'cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Tag color={config.color}>{t(`properties:propertyDetail.${config.key}`)}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // API returns dates in DD-MM-YYYY format, parse accordingly
    const [day, month, year] = dateString.split('-');
    return dayjs(`${year}-${month}-${day}`).format('MMM DD, YYYY');
  };

  const getTenantName = (lease: any) => {
    if (!lease.tenant) return t('properties:propertyDetail.unknownTenant');
    if (lease.tenant.first_name && lease.tenant.last_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    return t('properties:propertyDetail.unknownTenant');
  };

  const getUnitInfo = (lease: any) => {
    if (!lease.unit) return t('properties:propertyDetail.unknownUnit');
    if (lease.unit.unit_name) return lease.unit.unit_name;
    if (lease.unit.unit_number) return `Unit ${lease.unit.unit_number}`;
    return t('properties:propertyDetail.unknownUnit');
  };

  const handleViewLease = (leaseId: string) => {
    navigate(`/leases/${leaseId}`);
  };

  // Units table columns
  const unitsColumns: ColumnsType<Unit> = [
    {
      title: t('properties:propertyDetail.unitName'),
      dataIndex: 'unit_name',
      key: 'unit_name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: t('properties:propertyDetail.rentPerMonth'),
      dataIndex: 'rent_per_month',
      key: 'rent_per_month',
      render: (amount) => `TSh ${amount?.toLocaleString() || 0}`,
    },
    {
      title: t('properties:propertyDetail.status'),
      dataIndex: 'is_occupied',
      key: 'is_occupied',
      render: (isOccupied) => (
        <Tag color={isOccupied ? 'error' : 'success'}>
          {isOccupied ? t('properties:propertyDetail.occupied') : t('properties:propertyDetail.available')}
        </Tag>
      ),
    },
    {
      title: t('properties:propertyDetail.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditUnit(record)}
          >
            {t('properties:propertyDetail.edit')}
          </Button>
          <Button 
            type="link" 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUnit(record)}
          >
            {t('properties:propertyDetail.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  // Leases table columns
  const leasesColumns: ColumnsType<any> = [
    {
      title: t('properties:propertyDetail.leaseNumber'),
      dataIndex: 'lease_number',
      key: 'lease_number',
      render: (text: string) => <Text strong>{text || 'N/A'}</Text>,
      width: 140,
    },
    {
      title: t('properties:propertyDetail.unit'),
      key: 'unit',
      render: (_, record) => (
        <Space>
          <HomeOutlined />
          <Text>{getUnitInfo(record)}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: t('properties:propertyDetail.tenant'),
      key: 'tenant',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text>{getTenantName(record)}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: t('properties:propertyDetail.period'),
      key: 'period',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            <CalendarOutlined /> {formatDate(record.start_date)}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('properties:propertyDetail.to')} {formatDate(record.end_date)}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Rent Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <Text>{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount: number) => <Text type="success">{formatCurrency(amount)}</Text>,
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getLeaseStatusTag(status),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewLease(record.id)}
        >
          {t('properties:propertyDetail.view')}
        </Button>
      ),
      width: 80,
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
          {t('properties:propertyDetail.back')}
        </Button>
        <Alert
          title={t('common:common.error')}
          description={t('properties:propertyDetail.propertyNotFound')}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <ChatterLayout model="property" recordId={id || ''}>
      <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t('properties:propertyDetail.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <BankOutlined /> {property.property_name}
            </Title>
          </Space>
          <Space>
            {!isEditMode ? (
              <>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  {t('properties:propertyDetail.edit')}
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteProperty}
                  loading={deletePropertyMutation.isPending}
                >
                  {t('properties:propertyDetail.deleteProperty')}
                </Button>
              </>
            ) : (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  {t('properties:propertyDetail.cancel')}
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={updatePropertyMutation.isPending}
                >
                  {t('properties:propertyDetail.save')}
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {              key: 'details',
              label: t('properties:propertyDetail.propertyDetails'),
              children: (
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={t('properties:propertyDetail.propertyName')}
                        name="property_name"
                        rules={[{ required: true, message: t('properties:propertyDetail.propertyNameRequired') }]}
                      >
                        <Input
                          placeholder={t('properties:propertyDetail.enterPropertyName')}
                          disabled={!isEditMode}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label={t('properties:propertyDetail.propertyType')}
                        name="property_type"
                        rules={[{ required: true, message: t('properties:propertyDetail.propertyTypeRequired') }]}
                      >
                        <Select
                          placeholder={t('properties:propertyDetail.selectPropertyType')}
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
                        <Form.Item label={t('properties:propertyDetail.region')}>
                          <Input
                            value={property.address?.region_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          label={t('properties:propertyDetail.region')}
                          name="region"
                          rules={[{ required: true, message: t('properties:propertyDetail.regionRequired') }]}
                        >
                          <Select
                            placeholder={t('properties:propertyDetail.selectRegion')}
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
                        <Form.Item label={t('properties:propertyDetail.district')}>
                          <Input
                            value={property.address?.district_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          label={t('properties:propertyDetail.district')}
                          name="district"
                          rules={[{ required: true, message: t('properties:propertyDetail.districtRequired') }]}
                        >
                          <Select
                            placeholder={t('properties:propertyDetail.selectDistrict')}
                            disabled={!districts || districts.length === 0}
                            onChange={handleDistrictChange}
                            showSearch
                            filterOption={(input, option) =>
                              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={
                              form.getFieldValue('region')
                                ? t('properties:propertyDetail.noDistrictsAvailable')
                                : t('properties:propertyDetail.selectRegionFirst')
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
                        <Form.Item label={t('properties:propertyDetail.ward')}>
                          <Input
                            value={property.address?.ward_name || 'N/A'}
                            disabled
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item label={t('properties:propertyDetail.ward')} name="ward">
                          <Select
                            placeholder={t('properties:propertyDetail.selectWard')}
                            disabled={!wards || wards.length === 0}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={
                              form.getFieldValue('district')
                                ? t('properties:propertyDetail.noWardsAvailable')
                                : t('properties:propertyDetail.selectDistrictFirst')
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
                        label={t('properties:propertyDetail.street')}
                        name="street"
                        rules={[{ required: true, message: t('properties:propertyDetail.streetRequired') }]}
                      >
                        <Input
                          placeholder={t('properties:propertyDetail.enterStreetAddress')}
                          disabled={!isEditMode}
                          prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={t('properties:propertyDetail.totalUnits')}>
                        <Space.Compact style={{ width: '100%' }}>
                          <Input
                            value={property.units_count || 0}
                            disabled
                            style={{ width: 'calc(100% - 32px)' }}
                          />
                          <Button disabled icon={<HomeOutlined />} />
                        </Space.Compact>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <PropertyManagerField isEditMode={isEditMode} property={property} />
                    </Col>
                  </Row>
                </Form>
              ),
            },
            {
              key: 'units',
              label: (
                <span>
                  <HomeOutlined /> {t('properties:propertyDetail.units')} ({units.length})
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
                      {t('properties:propertyDetail.addUnit')}
                    </Button>
                  </div>
                  {unitsLoading ? (
                    <div>
                      <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 16 }} />
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  ) : unitsError ? (
                    <Alert
                      title={t('properties:propertyDetail.errorLoadingUnits')}
                      description={t('properties:propertyDetail.errorLoadingUnitsDesc')}
                      type="error"
                      showIcon
                    />
                  ) : units.length === 0 ? (
                    <Alert
                      title={t('properties:propertyDetail.noUnitsFound')}
                      description={t('properties:propertyDetail.noUnitsFoundDesc')}
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
            {
              key: 'leases',
              label: (
                <span>
                  <FileTextOutlined /> {t('properties:propertyDetail.leases')} ({leases.length})
                </span>
              ),
              children: (
                <div>
                  {leasesLoading ? (
                    <div>
                      <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 16 }} />
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  ) : leasesError ? (
                    <Alert
                      title={t('properties:propertyDetail.errorLoadingLeases')}
                      description={t('properties:propertyDetail.errorLoadingLeasesDesc')}
                      type="error"
                      showIcon
                    />
                  ) : leases.length === 0 ? (
                    <Alert
                      title={t('properties:propertyDetail.noLeasesFound')}
                      description={t('properties:propertyDetail.noLeasesFoundDesc')}
                      type="info"
                      showIcon
                    />
                  ) : (
                    <Table
                      columns={leasesColumns}
                      dataSource={leases}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                      onRow={(record) => ({
                        onClick: () => handleViewLease(record.id),
                        style: { cursor: 'pointer' },
                      })}
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

      {/* Chatter - Attachments */}
      </div>
    </ChatterLayout>
  );
};

export default PropertyDetail;
