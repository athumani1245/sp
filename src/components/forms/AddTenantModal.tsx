import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  message,
  Alert,
  Row,
  Col,
  Typography,
  Divider,
  Select,
  Card,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useCreateTenant } from '../../hooks/useTenants';

const { Text, Title } = Typography;

interface EmergencyContact {
  full_name: string;
  relationship: string;
  phone_number: string;
}

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded?: (data?: any) => void;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onTenantAdded,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const createTenantMutation = useCreateTenant();

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setError('');
      setEmergencyContacts([]);
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: any) => {
    setError('');

    try {
      const tenantData = {
        username: '+255' + values.username,
        password: 'StrongPass123',
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender || null,
        email: values.email || null,
        emergency_contacts: emergencyContacts,
        role: 'Tenant',
      };

      await createTenantMutation.mutateAsync(tenantData);
      
      if (onTenantAdded) {
        onTenantAdded();
      }
      
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.description || error.response?.data?.message || t('tenants:addTenantModal.createFailed'));
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

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>{t('tenants:addTenantModal.title')}</span>
          </Space>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <Divider />

        {error && (
          <Alert
            message={t('tenants:addTenantModal.error')}
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Title level={5}>
            <UserOutlined /> {t('tenants:addTenantModal.tenantInformation')}
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('tenants:addTenantModal.firstName')}
                name="first_name"
                rules={[
                  { required: true, message: t('tenants:addTenantModal.firstNameRequired') },
                  { min: 2, message: t('tenants:addTenantModal.firstNameMin') },
                ]}
                tooltip={t('tenants:addTenantModal.firstNameTooltip')}
              >
                <Input prefix={<UserOutlined />} placeholder={t('tenants:addTenantModal.firstNamePlaceholder')} size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t('tenants:addTenantModal.lastName')}
                name="last_name"
                rules={[
                  { required: true, message: t('tenants:addTenantModal.lastNameRequired') },
                  { min: 2, message: t('tenants:addTenantModal.lastNameMin') },
                ]}
                tooltip={t('tenants:addTenantModal.lastNameTooltip')}
              >
                <Input prefix={<UserOutlined />} placeholder={t('tenants:addTenantModal.lastNamePlaceholder')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label={t('tenants:addTenantModal.gender')} name="gender">
                <Select
                  size="large"
                  placeholder={t('tenants:addTenantModal.selectGender')}
                  allowClear
                  options={[
                    { value: 'Male', label: t('tenants:addTenantModal.male') },
                    { value: 'Female', label: t('tenants:addTenantModal.female') },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t('tenants:addTenantModal.email')}
                name="email"
                rules={[{ type: 'email', message: t('tenants:addTenantModal.emailInvalid') }]}
                tooltip={t('tenants:addTenantModal.emailTooltip')}
              >
                <Input prefix={<MailOutlined />} placeholder={t('tenants:addTenantModal.emailPlaceholder')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('tenants:addTenantModal.phoneNumber')}
                name="username"
                rules={[
                  { required: true, message: t('tenants:addTenantModal.phoneNumberRequired') },
                  {
                    pattern: /^[0-9]{9}$/,
                    message: t('tenants:addTenantModal.phoneNumberInvalid'),
                  },
                ]}
                tooltip={t('tenants:addTenantModal.phoneNumberTooltip')}
              >
                <Input
                  prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                  placeholder={t('tenants:addTenantModal.phoneNumberPlaceholder')}
                  maxLength={9}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>
            <Space>
              <TeamOutlined />
              {t('tenants:addTenantModal.emergencyContacts')}
            </Space>
          </Divider>

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
                  {t('tenants:addTenantModal.remove')}
                </Button>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label={t('tenants:addTenantModal.fullName')} style={{ marginBottom: 8 }}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder={t('tenants:addTenantModal.fullNamePlaceholder')}
                      value={contact.full_name}
                      onChange={(e) => updateEmergencyContact(index, 'full_name', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={t('tenants:addTenantModal.relationship')} style={{ marginBottom: 8 }}>
                    <Select
                      placeholder={t('tenants:addTenantModal.selectRelationship')}
                      value={contact.relationship || undefined}
                      onChange={(value) => updateEmergencyContact(index, 'relationship', value)}
                      style={{ width: '100%' }}
                      options={[
                        { value: 'Parent', label: t('tenants:addTenantModal.relationshipParent') },
                        { value: 'Friend', label: t('tenants:addTenantModal.relationshipFriend') },
                        { value: 'Spouse', label: t('tenants:addTenantModal.relationshipSpouse') },
                        { value: 'Relative', label: t('tenants:addTenantModal.relationshipRelative') },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={t('tenants:addTenantModal.phoneLabel')} style={{ marginBottom: 8 }}>
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder={t('tenants:addTenantModal.phoneNumberPlaceholder')}
                      value={contact.phone_number}
                      onChange={(e) =>
                        updateEmergencyContact(index, 'phone_number', e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={addEmergencyContact}
            icon={<PlusOutlined />}
            block
            style={{ marginBottom: 24 }}
          >
            {t('tenants:addTenantModal.addEmergencyContact')}
          </Button>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={onClose}
                disabled={createTenantMutation.isPending}
                size="large"
              >
                {t('tenants:addTenantModal.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createTenantMutation.isPending}
                size="large"
              >
                {createTenantMutation.isPending ? t('tenants:addTenantModal.creatingTenant') : t('tenants:addTenantModal.createTenant')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTenantModal;
