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
  theme,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  TeamOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useCreateTenant } from '../../hooks/useTenants';
import EmergencyContactsEditor, { EmergencyContact } from './EmergencyContactsEditor';

const { Text, Title } = Typography;

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
  const { token } = theme.useToken();
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
      const tenantData: any = {
        username: '+255' + values.username,
        password: 'StrongPass123',
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender || null,
        email: values.email || null,
        emergency_contacts: emergencyContacts,
        role: 'Tenant',
      };

      if (values.id_type && values.id_number) {
        tenantData.identification = {
          id_type: values.id_type,
          id_number: values.id_number,
        };
      }

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
            <UserOutlined style={{ color: token.colorPrimary }} />
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
                <Input prefix={<UserOutlined />} placeholder={t('tenants:addTenantModal.firstNamePlaceholder')} />
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
                <Input prefix={<UserOutlined />} placeholder={t('tenants:addTenantModal.lastNamePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label={t('tenants:addTenantModal.gender')} name="gender">
                <Select
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
                <Input prefix={<MailOutlined />} placeholder={t('tenants:addTenantModal.emailPlaceholder')} />
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
                  prefix={<><PhoneOutlined /> <Text type="secondary" style={{ marginLeft: 8 }}>+255</Text></>}
                  placeholder={t('tenants:addTenantModal.phoneNumberPlaceholder')}
                  maxLength={9}
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

          <EmergencyContactsEditor
            contacts={emergencyContacts}
            onAdd={addEmergencyContact}
            onRemove={removeEmergencyContact}
            onChange={updateEmergencyContact}
            relationshipOptions={[
              { value: 'Parent', label: t('tenants:addTenantModal.relationshipParent') },
              { value: 'Friend', label: t('tenants:addTenantModal.relationshipFriend') },
              { value: 'Spouse', label: t('tenants:addTenantModal.relationshipSpouse') },
              { value: 'Relative', label: t('tenants:addTenantModal.relationshipRelative') },
            ]}
            labels={{
              fullName: t('tenants:addTenantModal.fullName'),
              fullNamePlaceholder: t('tenants:addTenantModal.fullNamePlaceholder'),
              relationship: t('tenants:addTenantModal.relationship'),
              selectRelationship: t('tenants:addTenantModal.selectRelationship'),
              phoneNumber: t('tenants:addTenantModal.phoneLabel'),
              phoneNumberPlaceholder: t('tenants:addTenantModal.phoneNumberPlaceholder'),
              remove: t('tenants:addTenantModal.remove'),
              addContact: t('tenants:addTenantModal.addEmergencyContact'),
            }}
          />

          <Divider style={{ marginTop: 24 }}>
            <Space>
              <IdcardOutlined />
              {t('tenants:addTenantModal.identification')}
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label={t('tenants:addTenantModal.idType')} name="id_type">
                <Select
                  placeholder={t('tenants:addTenantModal.selectIdType')}
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
            <Col xs={24} md={16}>
              <Form.Item
                label={t('tenants:addTenantModal.idNumber')}
                name="id_number"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value && getFieldValue('id_type')) {
                        return Promise.reject(new Error(t('tenants:addTenantModal.idNumberRequired')));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder={t('tenants:addTenantModal.idNumberPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={onClose}
                disabled={createTenantMutation.isPending}
              >
                {t('tenants:addTenantModal.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createTenantMutation.isPending}
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
