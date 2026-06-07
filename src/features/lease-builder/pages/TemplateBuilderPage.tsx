import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button, Input, Space, Typography, Card, Drawer, Tooltip,
  Spin, Row, Col, Tag, message as antMessage,
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import LeaseEditor from '../components/editor/LeaseEditor';
import StyleToolbar from '../components/editor/StyleToolbar';
import VariablePicker from '../components/editor/VariablePicker';
import { useDocumentStore } from '../store/documentStore';
import { useLeaseTemplate, useCreateTemplate, useUpdateTemplate } from '../hooks/useLeaseTemplates';

const { Title, Text } = Typography;

const TemplateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [editorRef, setEditorRef] = useState<any>(null);
  const [variableDrawerOpen, setVariableDrawerOpen] = useState(false);

  const {
    templateName, setTemplateName, setTemplateId,
    editorJson, variables, setEditorJson, setVariables, reset,
    previewMode, togglePreview,
  } = useDocumentStore();

  const { data: template, isLoading: templateLoading } = useLeaseTemplate(id || null);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  // Load template into store when editing
  useEffect(() => {
    if (template) {
      setTemplateId(template.id);
      setTemplateName(template.name);
      setEditorJson(template.document_json);
      setVariables(template.variables);
    }
  }, [template]); // eslint-disable-line

  // Reset store when unmounting
  useEffect(() => {
    return () => { if (!isEditing) reset(); };
  }, []); // eslint-disable-line

  const handleSave = async () => {
    if (!templateName.trim()) {
      antMessage.warning('Please enter a template name');
      return;
    }
    if (!editorJson) {
      antMessage.warning('Document is empty');
      return;
    }

    const payload = { name: templateName, document_json: editorJson, variables };

    if (isEditing && id) {
      await updateTemplate.mutateAsync({ id, data: payload });
    } else {
      const created = await createTemplate.mutateAsync(payload);
      navigate(`/lease-builder/${created.id}/edit`, { replace: true });
    }
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  if (isEditing && templateLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
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
          zIndex: 10,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/lease-builder')}
        />

        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template name..."
          style={{ width: 280, fontWeight: 600, fontSize: 15 }}
          variant="borderless"
        />

        <div style={{ flex: 1 }} />

        <Space>
          {variables.length > 0 && (
            <Space size={4} wrap>
              {variables.slice(0, 3).map((v) => (
                <Tag key={v} color="gold" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {`{{ ${v} }}`}
                </Tag>
              ))}
              {variables.length > 3 && (
                <Tag color="default">+{variables.length - 3}</Tag>
              )}
            </Space>
          )}

          <Tooltip title={previewMode ? 'Back to Editor' : 'Preview Document'}>
            <Button
              icon={previewMode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={togglePreview}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </Tooltip>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSave}
          >
            {isEditing ? 'Update' : 'Save Template'}
          </Button>
        </Space>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Left: Variable Picker panel */}
        {!previewMode && (
          <div
            style={{
              width: 220,
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              padding: 16,
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            <Text strong style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 8 }}>
              INSERT VARIABLE
            </Text>
            <VariablePicker editor={editorRef} />
          </div>
        )}

        {/* Center: Editor / Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!previewMode ? (
            <>
              <StyleToolbar
                editor={editorRef}
                onInsertVariable={() => setVariableDrawerOpen(true)}
              />
              <div style={{ flex: 1, overflow: 'auto', padding: '24px 40px', background: '#f5f5f5' }}>
                <div style={{ maxWidth: 860, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <LeaseEditor onEditorReady={setEditorRef} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f5f5f5' }}>
              <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <Card style={{ marginBottom: 12, background: '#fef3c7', borderColor: '#fcd34d' }}>
                  <Text style={{ color: '#92400e', fontSize: 13 }}>
                    Preview mode — variables show as placeholders. Use Generate Lease to fill in tenant data.
                  </Text>
                </Card>
                {/* Lazy import DocumentRenderer to avoid circular */}
                <PreviewContent editorJson={editorJson} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variable picker drawer (mobile / toolbar button) */}
      <Drawer
        title="Insert Variable"
        placement="right"
        open={variableDrawerOpen}
        onClose={() => setVariableDrawerOpen(false)}
        width={280}
      >
        <VariablePicker editor={editorRef} />
      </Drawer>


    </div>
  );
};

// Lazy-loaded preview to keep editor fast
const PreviewContent = React.lazy(() => import('../components/DocumentRenderer').then((m) => ({
  default: ({ editorJson }: { editorJson: any }) => {
    const C = m.default;
    return <C editorJson={editorJson} tenantData={{}} />;
  },
})));

export default TemplateBuilderPage;
