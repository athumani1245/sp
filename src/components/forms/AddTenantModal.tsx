import React, { useState, useEffect, useMemo } from 'react';
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
  Upload,
  Card,
  Avatar,
  theme,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  TeamOutlined,
  IdcardOutlined,
  UploadOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useCreateTenant } from '../../hooks/useTenants';
import EmergencyContactsEditor, { EmergencyContact } from './EmergencyContactsEditor';

const { Text, Title } = Typography;

// Upload keeps files in the form until submit instead of posting them itself.
const fileListProps = {
  valuePropName: 'fileList',
  getValueFromEvent: (e: { fileList: UploadFile[] }) => e.fileList,
};

// Round photo picker; keeps the single selected file as a one-item UploadFile list.
const TenantPhotoInput: React.FC<{ value?: UploadFile[]; onChange?: (files: UploadFile[]) => void }> = ({
  value = [],
  onChange,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const file = value[0]?.originFileObj;
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <Space orientation="vertical" align="center" size={4} style={{ width: '100%' }}>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={() => false}
        onChange={({ fileList }) => onChange?.(fileList.slice(-1))}
      >
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Avatar size={80} src={preview} icon={<UserOutlined />} style={{ backgroundColor: token.colorFillSecondary, color: token.colorTextTertiary }} />
          <span
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: token.colorPrimary,
              color: token.colorWhite,
              border: `2px solid ${token.colorBgContainer}`,
            }}
          >
            <CameraOutlined />
          </span>
        </div>
      </Upload>
      <Text strong style={{ marginTop: 8 }}>{t('tenants:addTenantModal.attachment')}</Text>
      {file ? (
        <Button type="link" size="small" danger style={{ padding: 0, height: 'auto' }} onClick={() => onChange?.([])}>
          {t('tenants:addTenantModal.remove')}
        </Button>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>{t('tenants:addTenantModal.photoHint')}</Text>
      )}
    </Space>
  );
};

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

      const attachment: UploadFile[] = values.attachment || [];
      const identificationFiles: UploadFile[] = values.identification_files || [];

      // Files need multipart; nested objects ride along as JSON strings.
      let payload: any = tenantData;
      if (attachment.length || identificationFiles.length) {
        payload = new FormData();
        Object.entries(tenantData).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          payload.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });
        attachment.forEach((f) => payload.append('attachment', f.originFileObj as File));
        identificationFiles.forEach((f) => payload.append('identification_files', f.originFileObj as File));
      }

      await createTenantMutation.mutateAsync(payload);
      
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
            <Col xs={24} md={6}>
              <Card
                size="small"
                style={{ minHeight: 'calc(100% - 24px)', marginBottom: 24, display: 'flex', flexDirection: 'column' }}
                styles={{ body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
              >
                <Form.Item name="attachment" noStyle>
                  <TenantPhotoInput />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} md={18}>
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

          <Form.Item
            label={t('tenants:addTenantModal.identificationFiles')}
            name="identification_files"
            {...fileListProps}
          >
            <Upload accept="image/*,.pdf" multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>{t('tenants:addTenantModal.attachId')}</Button>
            </Upload>
          </Form.Item>

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
