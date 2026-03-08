import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Space,
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
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTenant, useUpdateTenant } from '../hooks/useTenants';

const { Title, Text } = Typography;

interface EmergencyContact {
  full_name: string;
  relationship: string;
  phone_number: string;
}

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
      });
      // Reset emergency contacts
      setEmergencyContacts(tenant.emergency_contacts || []);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateTenantMutation.mutateAsync({
        tenantId: id!,
        tenantData: {
          ...values,
          emergency_contacts: emergencyContacts,
        },
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
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
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
        </Space>
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

      {/* Emergency Contacts */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>{t('tenants:tenantDetail.emergencyContactsTitle')} ({emergencyContacts.length})</span>
          </Space>
        }
        style={{ marginTop: 16 }}
        extra={
          isEditMode && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addEmergencyContact}
            >
              {t('tenants:tenantDetail.addContact')}
            </Button>
          )
        }
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
            {emergencyContacts.map((contact, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeEmergencyContact(index)}
                  >
                    {t('tenants:tenantDetail.remove')}
                  </Button>
                }
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label={t('tenants:tenantDetail.fullName')} style={{ marginBottom: 8 }}>
                      <Input
                        prefix={<UserOutlined />}
                        placeholder={t('tenants:tenantDetail.fullNamePlaceholder')}
                        value={contact.full_name || ''}
                        onChange={(e) =>
                          updateEmergencyContact(index, 'full_name', e.target.value)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={t('tenants:tenantDetail.relationship')} style={{ marginBottom: 8 }}>
                      <Select
                        placeholder={t('tenants:tenantDetail.selectRelationship')}
                        value={contact.relationship || undefined}
                        onChange={(value) =>
                          updateEmergencyContact(index, 'relationship', value)
                        }
                        style={{ width: '100%' }}
                        options={[
                          { value: 'Parent', label: t('tenants:tenantDetail.relationshipParent') },
                          { value: 'Friend', label: t('tenants:tenantDetail.relationshipFriend') },
                          { value: 'Spouse', label: t('tenants:tenantDetail.relationshipSpouse') },
                          { value: 'Sibling', label: t('tenants:tenantDetail.relationshipSibling') },
                          { value: 'Relative', label: t('tenants:tenantDetail.relationshipRelative') },
                          { value: 'Other', label: t('tenants:tenantDetail.relationshipOther') },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={t('tenants:tenantDetail.phoneNumberLabel')} style={{ marginBottom: 8 }}>
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder={t('tenants:tenantDetail.phoneNumberPlaceholder')}
                        value={contact.phone_number || ''}
                        onChange={(e) =>
                          updateEmergencyContact(index, 'phone_number', e.target.value)
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
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
    </div>
  );
};

export default TenantDetail;
