import React from 'react';
import { Row, Col, Input, Select, Button, Typography, Tooltip, theme } from 'antd';
import { UserOutlined, PhoneOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface EmergencyContact {
  full_name: string;
  relationship: string;
  phone_number: string;
}

interface RelationshipOption {
  value: string;
  label: string;
}

interface EmergencyContactsEditorLabels {
  fullName: string;
  fullNamePlaceholder: string;
  relationship: string;
  selectRelationship: string;
  phoneNumber: string;
  phoneNumberPlaceholder: string;
  remove: string;
  addContact: string;
}

interface EmergencyContactsEditorProps {
  contacts: EmergencyContact[];
  relationshipOptions: RelationshipOption[];
  labels: EmergencyContactsEditorLabels;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof EmergencyContact, value: string) => void;
}

const EmergencyContactsEditor: React.FC<EmergencyContactsEditorProps> = ({
  contacts,
  relationshipOptions,
  labels,
  onAdd,
  onRemove,
  onChange,
}) => {
  const { token } = theme.useToken();

  return (
    <>
      {contacts.map((contact, index) => (
        <div
          key={index}
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <Tooltip title={labels.remove}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(index)}
                aria-label={labels.remove}
              />
            </Tooltip>
          </div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 500 }}>{labels.fullName}</Text>
              </div>
              <Input
                prefix={<UserOutlined />}
                placeholder={labels.fullNamePlaceholder}
                value={contact.full_name || ''}
                onChange={(e) => onChange(index, 'full_name', e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 500 }}>{labels.relationship}</Text>
              </div>
              <Select
                placeholder={labels.selectRelationship}
                value={contact.relationship || undefined}
                onChange={(value) => onChange(index, 'relationship', value)}
                style={{ width: '100%' }}
                options={relationshipOptions}
              />
            </Col>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: token.fontSizeSM, fontWeight: 500 }}>{labels.phoneNumber}</Text>
              </div>
              <Input
                prefix={<PhoneOutlined />}
                placeholder={labels.phoneNumberPlaceholder}
                value={contact.phone_number || ''}
                onChange={(e) => onChange(index, 'phone_number', e.target.value)}
              />
            </Col>
          </Row>
        </div>
      ))}
      <Button type="dashed" onClick={onAdd} icon={<PlusOutlined />} block>
        {labels.addContact}
      </Button>
    </>
  );
};

export default EmergencyContactsEditor;
