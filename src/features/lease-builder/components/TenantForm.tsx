import React from 'react';
import { Form, Input, Typography, Empty } from 'antd';
import { useDocumentStore } from '../store/documentStore';

const { Text } = Typography;

const TenantForm: React.FC = () => {
  const { variables, tenantData, updateTenantField } = useDocumentStore();

  if (!variables.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary" style={{ fontSize: 12 }}>
            No variables in template yet.
            <br />Insert variables using the editor toolbar.
          </Text>
        }
      />
    );
  }

  return (
    <Form layout="vertical" size="small">
      {variables.map((varId) => (
        <Form.Item
          key={varId}
          label={
            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
              {varId.replace(/_/g, ' ')}
            </span>
          }
          style={{ marginBottom: 12 }}
        >
          <Input
            placeholder={`Enter ${varId.replace(/_/g, ' ')}`}
            value={tenantData[varId] || ''}
            onChange={(e) => updateTenantField(varId, e.target.value)}
          />
        </Form.Item>
      ))}
    </Form>
  );
};

export default TenantForm;
