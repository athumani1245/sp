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
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useCreatePropertyManager, usePermissions } from '../../hooks/usePropertyManagers';

const { Title, Text } = Typography;

interface AddPropertyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManagerAdded?: (data?: any) => void;
}

const AVAILABLE_PERMISSIONS = [
  'can_manage_properties',
  'can_manage_tenants',
  'can_manage_leases',
  'can_view_reports',
  'can_manage_payments',
];

const AddPropertyManagerModal: React.FC<AddPropertyManagerModalProps> = ({
  isOpen,
  onClose,
  onManagerAdded,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const createManagerMutation = useCreatePropertyManager();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setError('');
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: any) => {
    setError('');

    try {
      const password = `${values.last_name.charAt(0).toUpperCase()}${values.last_name.slice(1).toLowerCase()}123!`;

      const managerData = {
        username: '+255' + values.username,
        password,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || '',
        permissions: values.permissions || [],
      };

      await createManagerMutation.mutateAsync(managerData);

      if (onManagerAdded) {
        onManagerAdded();
      }

      onClose();
    } catch (error: any) {
      setError(error.response?.data?.description || error.response?.data?.message || t('propertyManagers:addManagerModal.createFailed'));
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>{t('propertyManagers:addManagerModal.title')}</span>
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
            message={t('propertyManagers:addManagerModal.error')}
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
            <UserOutlined /> {t('propertyManagers:addManagerModal.managerInformation')}
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('propertyManagers:addManagerModal.firstName')}
                name="first_name"
                rules={[
                  { required: true, message: t('propertyManagers:addManagerModal.firstNameRequired') },
                  { min: 2, message: t('propertyManagers:addManagerModal.firstNameMin') },
                ]}
                tooltip={t('propertyManagers:addManagerModal.firstNameTooltip')}
              >
                <Input prefix={<UserOutlined />} placeholder={t('propertyManagers:addManagerModal.firstNamePlaceholder')} size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t('propertyManagers:addManagerModal.lastName')}
                name="last_name"
                rules={[
                  { required: true, message: t('propertyManagers:addManagerModal.lastNameRequired') },
                  { min: 2, message: t('propertyManagers:addManagerModal.lastNameMin') },
                ]}
                tooltip={t('propertyManagers:addManagerModal.lastNameTooltip')}
              >
                <Input prefix={<UserOutlined />} placeholder={t('propertyManagers:addManagerModal.lastNamePlaceholder')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t('propertyManagers:addManagerModal.phoneNumber')}
                name="username"
                rules={[
                  { required: true, message: t('propertyManagers:addManagerModal.phoneNumberRequired') },
                  {
                    pattern: /^[0-9]{9}$/,
                    message: t('propertyManagers:addManagerModal.phoneNumberInvalid'),
                  },
                ]}
                tooltip={t('propertyManagers:addManagerModal.phoneNumberTooltip')}
              >
                <Input
                  prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                  placeholder={t('propertyManagers:addManagerModal.phoneNumberPlaceholder')}
                  maxLength={9}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t('propertyManagers:addManagerModal.email')}
                name="email"
                rules={[{ type: 'email', message: t('propertyManagers:addManagerModal.emailInvalid') }]}
                tooltip={t('propertyManagers:addManagerModal.emailTooltip')}
              >
                <Input prefix={<MailOutlined />} placeholder={t('propertyManagers:addManagerModal.emailPlaceholder')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>{t('propertyManagers:addManagerModal.permissions')}</Divider>

          <Form.Item name="permissions">
            {permissionsLoading ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <LoadingOutlined style={{ fontSize: 20, marginRight: 8 }} />
                <Text type="secondary">{t('propertyManagers:addManagerModal.loadingPermissions')}</Text>
              </div>
            ) : permissions && permissions.length > 0 ? (
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 8]}>
                  {permissions.map((perm: any) => (
                    <Col xs={24} md={12} key={perm.id}>
                      <Checkbox value={perm.id}>
                        {perm.description}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            ) : (
              <Text type="secondary">{t('propertyManagers:addManagerModal.noPermissions')}</Text>
            )}
          </Form.Item>

          <Alert
            message={t('propertyManagers:addManagerModal.passwordNote')}
            description={t('propertyManagers:addManagerModal.passwordNoteDesc')}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={onClose}
                disabled={createManagerMutation.isPending}
                size="large"
              >
                {t('propertyManagers:addManagerModal.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createManagerMutation.isPending}
                size="large"
              >
                {createManagerMutation.isPending ? t('propertyManagers:addManagerModal.creatingManager') : t('propertyManagers:addManagerModal.createManager')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddPropertyManagerModal;
