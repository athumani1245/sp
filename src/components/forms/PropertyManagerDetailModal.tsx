import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Alert,
  Row,
  Col,
  Typography,
  Divider,
  Checkbox,
  Skeleton,
  Tag,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  EditOutlined,
  LoadingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  usePropertyManager,
  useUpdatePropertyManager,
  usePermissions,
} from '../../hooks/usePropertyManagers';

const { Title, Text } = Typography;

interface PropertyManagerDetailModalProps {
  isOpen: boolean;
  managerId: string | null;
  onClose: () => void;
}

const PropertyManagerDetailModal: React.FC<PropertyManagerDetailModalProps> = ({
  isOpen,
  managerId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const { data: manager, isLoading } = usePropertyManager(isOpen ? managerId : null);
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const updateMutation = useUpdatePropertyManager();

  useEffect(() => {
    if (isOpen) {
      setEditing(false);
      setError('');
    }
  }, [isOpen, managerId]);

  useEffect(() => {
    if (manager && editing) {
      const phone = manager.username?.startsWith('+255')
        ? manager.username.slice(4)
        : manager.username || '';
      form.setFieldsValue({
        first_name: manager.first_name,
        last_name: manager.last_name,
        username: phone,
        email: manager.email || '',
        permissions: manager.permissions?.map((p: any) => (typeof p === 'object' ? p.id : p)) || [],
      });
    }
  }, [manager, editing, form]);

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setError('');
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (!managerId) return;
    setError('');

    try {
      const managerData: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        username: '+255' + values.username,
        email: values.email || '',
        permissions: values.permissions || [],
      };

      await updateMutation.mutateAsync({ managerId, managerData });
      setEditing(false);
    } catch (err: any) {
      setError(
        err.response?.data?.description ||
          err.response?.data?.message ||
          t('propertyManagers:detailModal.updateFailed')
      );
    }
  };

  const getPermissionLabel = (permId: string) => {
    if (!permissions) return permId;
    const found = permissions.find((p: any) => p.id === permId);
    return found?.description || found?.name || permId;
  };

  const managerPermissions: string[] =
    manager?.permissions?.map((p: any) => (typeof p === 'object' ? p.id : p)) || [];

  // ── View Mode ──
  const renderViewMode = () => {
    if (isLoading) {
      return (
        <div style={{ padding: '16px 0' }}>
          <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 16 }} />
          <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 16 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      );
    }

    if (!manager) {
      return <Alert message={t('propertyManagers:detailModal.notFound')} type="warning" showIcon />;
    }

    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
            padding: '16px 20px',
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#CC5B4B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 18, display: 'block' }}>
              {manager.first_name} {manager.last_name}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t('propertyManagers:propertyManagers.title')}
            </Text>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('propertyManagers:addManagerModal.firstName')}
              </Text>
            </div>
            <Text strong>{manager.first_name}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('propertyManagers:addManagerModal.lastName')}
              </Text>
            </div>
            <Text strong>{manager.last_name}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('propertyManagers:addManagerModal.phoneNumber')}
              </Text>
            </div>
            <Space>
              <PhoneOutlined style={{ color: '#CC5B4B' }} />
              <Text>{manager.username}</Text>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('propertyManagers:addManagerModal.email')}
              </Text>
            </div>
            {manager.email ? (
              <Space>
                <MailOutlined style={{ color: '#CC5B4B' }} />
                <Text>{manager.email}</Text>
              </Space>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Col>
        </Row>

        <Divider>{t('propertyManagers:addManagerModal.permissions')}</Divider>

        {managerPermissions.length > 0 ? (
          <Space wrap>
            {managerPermissions.map((pId) => (
              <Tag color="blue" key={pId}>
                {getPermissionLabel(pId)}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">{t('propertyManagers:detailModal.noPermissions')}</Text>
        )}
      </>
    );
  };

  // ── Edit Mode ──
  const renderEditMode = () => (
    <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
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

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('propertyManagers:addManagerModal.firstName')}
            name="first_name"
            rules={[
              { required: true, message: t('propertyManagers:addManagerModal.firstNameRequired') },
              { min: 2, message: t('propertyManagers:addManagerModal.firstNameMin') },
            ]}
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
              { pattern: /^[0-9]{9}$/, message: t('propertyManagers:addManagerModal.phoneNumberInvalid') },
            ]}
          >
            <Input
              prefix={
                <>
                  <PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span>
                </>
              }
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
                  <Checkbox value={perm.id}>{perm.description}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        ) : (
          <Text type="secondary">{t('propertyManagers:addManagerModal.noPermissions')}</Text>
        )}
      </Form.Item>

      <Divider />

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancelEdit} disabled={updateMutation.isPending} size="large">
            {t('propertyManagers:addManagerModal.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            size="large"
          >
            {updateMutation.isPending
              ? t('propertyManagers:detailModal.saving')
              : t('propertyManagers:detailModal.saveChanges')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <Modal
      title={
        <Space>
          {editing ? (
            <EditOutlined style={{ color: '#CC5B4B' }} />
          ) : (
            <EyeOutlined style={{ color: '#CC5B4B' }} />
          )}
          <span>
            {editing
              ? t('propertyManagers:detailModal.editTitle')
              : t('propertyManagers:detailModal.viewTitle')}
          </span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={
        !editing && !isLoading && manager
          ? [
              <Button key="close" onClick={onClose}>
                {t('propertyManagers:addManagerModal.cancel')}
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' }}
              >
                {t('propertyManagers:detailModal.edit')}
              </Button>,
            ]
          : editing
          ? null
          : undefined
      }
      width={700}
      destroyOnClose
    >
      {editing ? renderEditMode() : renderViewMode()}
    </Modal>
  );
};

export default PropertyManagerDetailModal;
