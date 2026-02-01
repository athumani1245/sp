import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTenant, useUpdateTenant } from '../hooks/useTenants';

const { Title, Text } = Typography;

const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);

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
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateTenantMutation.mutateAsync({
        tenantId: id!,
        tenantData: values,
      });
      setIsEditMode(false);
    } catch (error) {
      // Error already handled by mutation or validation
    }
  };

  // Emergency contacts table columns
  const emergencyContactsColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneFilled />
          <Text>{phone || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Relationship',
      dataIndex: 'relationship',
      key: 'relationship',
      render: (relationship) => relationship || 'N/A',
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
          Back to Tenants
        </Button>
        <Alert
          message="Error"
          description="Failed to load tenant details. Please try again."
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
              <UserOutlined /> {tenant.first_name} {tenant.last_name}
            </Title>
          </Space>
          <Space>
            {!isEditMode ? (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Edit Tenant
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
                  loading={updateTenantMutation.isPending}
                >
                  Save Changes
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {/* Tenant Details Form */}
      <Card title="Tenant Information">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input
                  placeholder="Enter first name"
                  disabled={!isEditMode}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input
                  placeholder="Enter last name"
                  disabled={!isEditMode}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone Number"
                name="username"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input
                  placeholder="Enter phone number"
                  disabled
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input
                  placeholder="Enter email address"
                  disabled={!isEditMode}
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Gender" name="gender">
                <Select
                  placeholder="Select gender"
                  disabled={!isEditMode}
                  allowClear
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Emergency Contacts">
                <Input
                  value={tenant.emergency_contacts?.length || 0}
                  disabled
                  addonAfter="contacts"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Emergency Contacts */}
      <Card 
        title={`Emergency Contacts (${tenant.emergency_contacts?.length || 0})`}
        style={{ marginTop: 16 }}
      >
        <Table
          columns={emergencyContactsColumns}
          dataSource={tenant.emergency_contacts || []}
          rowKey={(record, index) => record.id || index}
          pagination={false}
          locale={{
            emptyText: 'No emergency contacts added',
          }}
        />
      </Card>
    </div>
  );
};

export default TenantDetail;
