import React, { useState, useEffect } from 'react';
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
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setError('');
      setEmergencyContacts([]);
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
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

      // Simulate API call
      setTimeout(() => {
        messageApi.success('Tenant created successfully!');

        if (onTenantAdded) {
          onTenantAdded({ id: Date.now().toString(), ...tenantData });
        }

        setTimeout(() => {
          onClose();
          setSubmitLoading(false);
        }, 1000);
      }, 500);
    } catch (error: any) {
      setError(error.message || 'Failed to create tenant. Please try again.');
      setSubmitLoading(false);
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
            <span>Add New Tenant</span>
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
            message="Error"
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
            <UserOutlined /> Tenant Information
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[
                  { required: true, message: 'Please enter first name' },
                  { min: 2, message: 'First name must be at least 2 characters' },
                ]}
                tooltip="Tenant's legal first name as it appears on official documents"
              >
                <Input prefix={<UserOutlined />} placeholder="Enter first name" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[
                  { required: true, message: 'Please enter last name' },
                  { min: 2, message: 'Last name must be at least 2 characters' },
                ]}
                tooltip="Tenant's legal last name (surname/family name)"
              >
                <Input prefix={<UserOutlined />} placeholder="Enter last name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Gender" name="gender">
                <Select
                  size="large"
                  placeholder="Select gender"
                  allowClear
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                tooltip="Tenant's email address (optional)"
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email address" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="username"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  {
                    pattern: /^[0-9]{9}$/,
                    message: 'Phone number must be exactly 9 digits',
                  },
                ]}
                tooltip="Primary contact number (9 digits). This will be used as the tenant's username for login."
              >
                <Input
                  prefix={<><PhoneOutlined /> <span style={{ marginLeft: 8, color: '#666' }}>+255</span></>}
                  placeholder="Enter 9 digit phone number"
                  maxLength={9}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>
            <Space>
              <TeamOutlined />
              Emergency Contacts
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
                  Remove
                </Button>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Full Name" style={{ marginBottom: 8 }}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Enter full name"
                      value={contact.full_name}
                      onChange={(e) => updateEmergencyContact(index, 'full_name', e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Relationship" style={{ marginBottom: 8 }}>
                    <Select
                      placeholder="Select relationship"
                      value={contact.relationship || undefined}
                      onChange={(value) => updateEmergencyContact(index, 'relationship', value)}
                      style={{ width: '100%' }}
                      options={[
                        { value: 'Parent', label: 'Parent' },
                        { value: 'Friend', label: 'Friend' },
                        { value: 'Spouse', label: 'Spouse' },
                        { value: 'Relative', label: 'Relative' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Phone Number" style={{ marginBottom: 8 }}>
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Enter phone number"
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
            Add Emergency Contact
          </Button>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={onClose}
                disabled={submitLoading}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitLoading}
                size="large"
              >
                {submitLoading ? 'Creating Tenant...' : 'Create Tenant'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTenantModal;
