import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Space,
  Flex,
  Typography,
  Skeleton,
  Alert,
  Form,
  Input,
  Select,
  Row,
  Col,
  Table,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  PhoneFilled,
  TeamOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTenant, useUpdateTenant } from '../hooks/useTenants';
import ChatterLayout from '../components/layout/ChatterLayout';
import EmergencyContactsEditor, { EmergencyContact } from '../components/forms/EmergencyContactsEditor';

const { Title, Text } = Typography;

const TenantDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  // Fetch data using TanStack Query hooks
  const { data: tenant, isLoading, error } = useTenant(id || '');
  const updateTenantMutation = useUpdateTenant();

  // Update form when tenant data loads
  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        username: tenant.username,
        email: tenant.email,
        gender: tenant.gender,
        id_type: tenant.identification?.id_type || null,
        id_number: tenant.identification?.id_number || '',
      });
      // Initialize emergency contacts
      setEmergencyContacts(tenant.emergency_contacts || []);
    }
  }, [tenant, form]);

  const handleBack = () => {
    navigate('/tenants');
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to original values
    if (tenant) {
      form.setFieldsValue({
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        username: tenant.username,
        email: tenant.email,
        gender: tenant.gender,
        id_type: tenant.identification?.id_type || null,
        id_number: tenant.identification?.id_number || '',
      });
      // Reset emergency contacts
      setEmergencyContacts(tenant.emergency_contacts || []);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { id_type, id_number, ...rest } = values;
      const tenantData: any = {
        ...rest,
        emergency_contacts: emergencyContacts,
      };
      if (id_type || id_number) {
        tenantData.identification = { id_type: id_type || null, id_number: id_number || '' };
      }
      await updateTenantMutation.mutateAsync({
        tenantId: id!,
        tenantData,
      });
      setIsEditMode(false);
    } catch (error) {
      // Error already handled by mutation or validation
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { full_name: '', relationship: '', phone_number: '' },
    ]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  // Emergency contacts table columns
  const emergencyContactsColumns: ColumnsType<any> = [
    {
      title: t('tenants:tenantDetail.fullName'),
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text || t('tenants:tenantDetail.na')}</Text>
        </Space>
      ),
    },
    {
      title: t('tenants:tenantDetail.phoneNumberLabel'),
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (phone) => (
        <Space>
          <PhoneFilled />
          <Text>{phone || t('tenants:tenantDetail.na')}</Text>
        </Space>
      ),
    },
    {
      title: t('tenants:tenantDetail.relationship'),
      dataIndex: 'relationship',
      key: 'relationship',
      render: (relationship) => relationship || t('tenants:tenantDetail.na'),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton.Button active style={{ marginBottom: 16 }} />
        <Card style={{ marginBottom: 16 }}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
        <Card>
          <Skeleton active title paragraph={{ rows: 3 }} />
        </Card>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
          {t('tenants:tenantDetail.back')}
        </Button>
        <Alert
          message={t('common:common.error')}
          description={t('tenants:tenantDetail.tenantNotFound')}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <ChatterLayout model="tenant" recordId={id || ''}>
      <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t('tenants:tenantDetail.back')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <UserOutlined /> {tenant.first_name} {tenant.last_name}
            </Title>
          </Space>
          <Space>
            {!isEditMode ? (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                {t('tenants:tenantDetail.edit')}
              </Button>
            ) : (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  {t('tenants:tenantDetail.cancel')}
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={updateTenantMutation.isPending}
                >
                  {t('tenants:tenantDetail.save')}
                </Button>
              </>
            )}
          </Space>
        </Flex>
      </div>

      {/* Tenant Details Form */}
      <Card title={t('tenants:tenantDetail.tenantInformation')}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('tenants:tenantDetail.firstName')}
                name="first_name"
                rules={[{ required: true, message: t('tenants:tenantDetail.firstNameRequired') }]}
              >
                <Input
                  placeholder={t('tenants:tenantDetail.firstNamePlaceholder')}
                  disabled={!isEditMode}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('tenants:tenantDetail.lastName')}
                name="last_name"
                rules={[{ required: true, message: t('tenants:tenantDetail.lastNameRequired') }]}
              >
                <Input
                  placeholder={t('tenants:tenantDetail.lastNamePlaceholder')}
                  disabled={!isEditMode}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('tenants:tenantDetail.phoneNumber')}
                name="username"
                rules={[{ required: true, message: t('tenants:tenantDetail.phoneNumberRequired') }]}
              >
                <Input
                  placeholder={t('tenants:tenantDetail.phoneNumberPlaceholder')}
                  disabled={!isEditMode}
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('tenants:tenantDetail.email')}
                name="email"
                rules={[{ type: 'email', message: t('tenants:tenantDetail.emailInvalid') }]}
              >
                <Input
                  placeholder={t('tenants:tenantDetail.emailPlaceholder')}
                  disabled={!isEditMode}
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t('tenants:tenantDetail.gender')} name="gender">
                <Select
                  placeholder={t('tenants:tenantDetail.selectGender')}
                  disabled={!isEditMode}
                  allowClear
                  options={[
                    { value: 'Male', label: t('tenants:tenantDetail.male') },
                    { value: 'Female', label: t('tenants:tenantDetail.female') },
                    { value: 'Other', label: t('tenants:tenantDetail.other') },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Identification */}
      <Card
        title={
          <Space>
            <IdcardOutlined />
            <span>{t('tenants:tenantDetail.identification')}</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label={t('tenants:tenantDetail.idType')} name="id_type">
                <Select
                  placeholder={t('tenants:tenantDetail.selectIdType')}
                  disabled={!isEditMode}
                  allowClear
                  options={[
                    { value: 'NIDA', label: 'NIDA' },
                    { value: 'PASSPORT', label: 'Passport' },
                    { value: 'DRIVING_LICENSE', label: 'Driving License' },
                    { value: 'VOTER_ID', label: 'Voter ID' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item label={t('tenants:tenantDetail.idNumber')} name="id_number">
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder={t('tenants:tenantDetail.idNumberPlaceholder')}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Emergency Contacts */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>{t('tenants:tenantDetail.emergencyContactsTitle')} ({emergencyContacts.length})</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        {isEditMode ? (
          <>
            {emergencyContacts.length === 0 ? (
              <Alert
                message={t('tenants:tenantDetail.noEmergencyContacts')}
                description={t('tenants:tenantDetail.noEmergencyContactsDesc')}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : null}
            <EmergencyContactsEditor
              contacts={emergencyContacts}
              onAdd={addEmergencyContact}
              onRemove={removeEmergencyContact}
              onChange={updateEmergencyContact}
              relationshipOptions={[
                { value: 'Parent', label: t('tenants:tenantDetail.relationshipParent') },
                { value: 'Friend', label: t('tenants:tenantDetail.relationshipFriend') },
                { value: 'Spouse', label: t('tenants:tenantDetail.relationshipSpouse') },
                { value: 'Sibling', label: t('tenants:tenantDetail.relationshipSibling') },
                { value: 'Relative', label: t('tenants:tenantDetail.relationshipRelative') },
                { value: 'Other', label: t('tenants:tenantDetail.relationshipOther') },
              ]}
              labels={{
                fullName: t('tenants:tenantDetail.fullName'),
                fullNamePlaceholder: t('tenants:tenantDetail.fullNamePlaceholder'),
                relationship: t('tenants:tenantDetail.relationship'),
                selectRelationship: t('tenants:tenantDetail.selectRelationship'),
                phoneNumber: t('tenants:tenantDetail.phoneNumberLabel'),
                phoneNumberPlaceholder: t('tenants:tenantDetail.phoneNumberPlaceholder'),
                remove: t('tenants:tenantDetail.remove'),
                addContact: t('tenants:tenantDetail.addContact'),
              }}
            />
          </>
        ) : (
          <Table
            columns={emergencyContactsColumns}
            dataSource={emergencyContacts}
            rowKey={(record, index) => `contact-${index}`}
            pagination={false}
            locale={{
              emptyText: t('tenants:tenantDetail.noContactsAdded'),
            }}
          />
        )}
      </Card>

      {/* Chatter - Attachments */}
      </div>
    </ChatterLayout>
  );
};

export default TenantDetail;
