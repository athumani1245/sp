import React, { useEffect, useState } from 'react';
import {
  Button, Card, Typography, Spin, Space, Alert, Divider,
  Row, Col, Tag, Tooltip, message as antMessage,
} from 'antd';
import {
  ArrowLeftOutlined, FilePdfOutlined, PrinterOutlined,
  DownloadOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeaseTemplate } from '../hooks/useLeaseTemplates';
import { useDocumentStore } from '../store/documentStore';
import DocumentRenderer from '../components/DocumentRenderer';
import TenantForm from '../components/TenantForm';
import { exportToPDF } from '../export/ExportPDF';

const { Title, Text } = Typography;

const LeaseGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [exporting, setExporting] = useState(false);

  const {
    templateName, tenantData, editorJson, variables,
    setTemplateName, setEditorJson, setVariables, setTenantData,
  } = useDocumentStore();

  const { data: template, isLoading } = useLeaseTemplate(id || null);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setEditorJson(template.document_json);
      setVariables(template.variables);
      setTenantData({});
    }
  }, [template]); // eslint-disable-line

  const handleExport = async () => {
    if (!editorJson) return;
    setExporting(true);
    try {
      await exportToPDF(editorJson, tenantData, templateName);
    } catch {
      antMessage.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filledCount = variables.filter((v) => !!tenantData[v]?.trim()).length;
  const allFilled = filledCount === variables.length && variables.length > 0;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!template) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Template not found" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
      {/* Top bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/lease-builder')}
        />

        <div>
          <Text strong style={{ fontSize: 15 }}>Generate Lease</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Template: <strong>{templateName}</strong>
          </Text>
        </div>

        <div style={{ flex: 1 }} />

        <Space>
          <Tag color={allFilled ? 'success' : 'warning'}>
            {filledCount}/{variables.length} variables filled
          </Tag>

          <Tooltip title="Reset form">
            <Button icon={<ReloadOutlined />} onClick={() => setTenantData({})} />
          </Tooltip>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="no-print"
          >
            Print
          </Button>

          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            Export PDF
          </Button>
        </Space>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Tenant form */}
        <div
          style={{
            width: 280,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            padding: '16px',
            overflow: 'auto',
            flexShrink: 0,
          }}
        >
          <Text strong style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 12 }}>
            FILL IN TENANT DETAILS
          </Text>

          {!allFilled && variables.length > 0 && (
            <Alert
              type="info"
              message={`${variables.length - filledCount} field${variables.length - filledCount > 1 ? 's' : ''} remaining`}
              style={{ marginBottom: 12, fontSize: 12 }}
              showIcon
            />
          )}

          <TenantForm />
        </div>

        {/* Right: Document preview */}
        <div
          style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#e5e7eb' }}
          id="print-area"
        >
          <DocumentRenderer editorJson={editorJson} tenantData={tenantData} />
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #print-area {
            padding: 0 !important;
            background: #fff !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaseGeneratorPage;
