import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, Button, Space, Typography, Tag, Empty,
  Spin, Form, Input, Alert, Divider, Tooltip, Badge, Drawer,
} from 'antd';
import {
  FileTextOutlined, FilePdfOutlined, PrinterOutlined,
  CheckCircleFilled, FormOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { VariableNode } from './editor/extensions/VariableNode';
import StyleToolbar from './editor/StyleToolbar';
import VariablePicker from './editor/VariablePicker';
import { useLeaseTemplates } from '../hooks/useLeaseTemplates';
import { mapLeaseToTemplateData, mapPaymentAccountsToTemplateData } from '../utils/mapLeaseToTemplateData';
import { exportToPDF } from '../export/ExportPDF';
import { VARIABLE_LABEL_MAP } from '../utils/variableDefinitions';
import { usePaymentAccounts } from '../../../hooks/usePaymentAccounts';
import type { LeaseTemplate } from '../services/leaseTemplateService';

const { Text } = Typography;

const EDITOR_EXTENSIONS = [
  StarterKit,
  TextStyle,
  FontFamily,
  Color,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Underline,
  Highlight.configure({ multicolor: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  VariableNode,
];

interface Props {
  open: boolean;
  onClose: () => void;
  lease: any;
}

const LeaseDocumentModal: React.FC<Props> = ({ open, onClose, lease }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LeaseTemplate | null>(null);
  const [tenantData, setTenantData] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [variableDrawerOpen, setVariableDrawerOpen] = useState(false);

  // Track last loaded template id to avoid re-setting content on tenantData changes
  const loadedTemplateIdRef = useRef<string | null>(null);

  const { data: templates = [], isLoading } = useLeaseTemplates();
  const { data: paymentAccounts = [] } = usePaymentAccounts();

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
  });

  // Auto-select first template when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]); // eslint-disable-line

  // When selected template changes: fill tenant data AND load content into editor
  useEffect(() => {
    if (!selectedTemplate || !lease) return;

    const mapped = {
      ...mapLeaseToTemplateData(lease),
      // Payment accounts from dedicated endpoint take priority over lease-embedded ones
      ...mapPaymentAccountsToTemplateData(paymentAccounts),
    };
    const prefilled: Record<string, string> = {};
    selectedTemplate.variables.forEach((v) => {
      prefilled[v] = mapped[v] || '';
    });
    setTenantData(prefilled);

    // Load template JSON into editor only when template actually changes
    if (editor && loadedTemplateIdRef.current !== selectedTemplate.id) {
      editor.commands.setContent(selectedTemplate.document_json);
      loadedTemplateIdRef.current = selectedTemplate.id;
    }
  }, [selectedTemplate, lease, editor, paymentAccounts]); // eslint-disable-line

  const handleClose = () => {
    setSelectedTemplate(null);
    setTenantData({});
    loadedTemplateIdRef.current = null;
    if (editor) editor.commands.clearContent();
    onClose();
  };

  const handleExport = async () => {
    if (!selectedTemplate || !editor) return;
    setExporting(true);
    try {
      await exportToPDF(
        editor.getJSON(),
        tenantData,
        `${lease?.lease_number || 'lease'} - ${tenantData['tenant_name'] || [lease?.tenant?.first_name, lease?.tenant?.last_name].filter(Boolean).join(' ') || 'tenant'}`,
      );
    } finally {
      setExporting(false);
    }
  };

  const leaseMap = lease
    ? { ...mapLeaseToTemplateData(lease), ...mapPaymentAccountsToTemplateData(paymentAccounts) }
    : {};
  const filledCount = selectedTemplate
    ? selectedTemplate.variables.filter((v) => !!tenantData[v]?.trim()).length
    : 0;
  const totalVars = selectedTemplate?.variables.length || 0;
  const emptyCount = totalVars - filledCount;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width="95vw"
      style={{ top: 16, maxWidth: 1400, padding: 0 }}
      styles={{
        body: { padding: 0, height: 'calc(90vh - 110px)', display: 'flex', overflow: 'hidden' },
        header: { padding: '14px 20px', borderBottom: '1px solid #f0f0f0', marginBottom: 0 },
        footer: { padding: '10px 20px', borderTop: '1px solid #f0f0f0', marginTop: 0 },
      }}
      title={
        <Space>
          <FilePdfOutlined style={{ color: '#CC5B4B' }} />
          <span>Lease Document — <strong>{lease?.lease_number}</strong></span>
          {selectedTemplate && (
            <Tag style={{ marginLeft: 4 }}>{selectedTemplate.name}</Tag>
          )}
        </Space>
      }
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Close</Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="no-print"
            disabled={!selectedTemplate}
          >
            Print
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            loading={exporting}
            onClick={handleExport}
            disabled={!selectedTemplate}
          >
            Export PDF
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      {/* ── LEFT SIDENAV ── */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#fafafa',
        }}
      >
        {/* Templates section */}
        <div style={{ padding: '12px 14px 8px', flexShrink: 0 }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>
            TEMPLATES
          </Text>
        </div>

        {/* Templates list — capped so variables section always has room */}
        <div style={{ flex: '0 1 auto', maxHeight: '38%', overflow: 'auto', paddingBottom: 8 }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Spin size="small" />
            </div>
          ) : templates.length === 0 ? (
            <div style={{ padding: '16px 14px' }}>
              <Empty
                image={<FormOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />}
                imageStyle={{ height: 40 }}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    No templates.{' '}
                    <a href="/lease-builder/new" target="_blank" rel="noopener noreferrer">
                      Create one
                    </a>
                  </Text>
                }
              />
            </div>
          ) : (
            templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const autoCount = template.variables.filter((v) => !!leaseMap[v]).length;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '9px 14px',
                    cursor: 'pointer',
                    background: isSelected ? '#fff7f5' : 'transparent',
                    borderRight: isSelected ? '3px solid #CC5B4B' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <FileTextOutlined
                    style={{
                      fontSize: 16,
                      color: isSelected ? '#CC5B4B' : '#8c8c8c',
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong={isSelected}
                      style={{
                        fontSize: 13,
                        color: isSelected ? '#CC5B4B' : '#1f2937',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {template.name}
                    </Text>
                    <Space size={4} style={{ marginTop: 3 }}>
                      <Tooltip
                        title={`${autoCount} of ${template.variables.length} variables auto-filled from lease data`}
                      >
                        <Tag
                          color={autoCount === template.variables.length ? 'success' : 'warning'}
                          style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px' }}
                        >
                          {autoCount}/{template.variables.length} auto-filled
                        </Tag>
                      </Tooltip>
                    </Space>
                  </div>
                  {isSelected && (
                    <CheckOutlined style={{ color: '#CC5B4B', fontSize: 12, flexShrink: 0 }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Variables form section — takes all remaining sidebar height */}
        {selectedTemplate && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ padding: '10px 14px 6px', flexShrink: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>
                  VARIABLES
                </Text>
                {emptyCount > 0 ? (
                  <Badge count={emptyCount} size="small" color="#faad14" />
                ) : (
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 13 }} />
                )}
              </Space>
            </div>

            {emptyCount > 0 && (
              <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
                <Alert
                  type="warning"
                  message={`${emptyCount} field${emptyCount > 1 ? 's' : ''} empty`}
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  showIcon
                />
              </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 14px' }}>
              <Form layout="vertical" size="small">
                {selectedTemplate.variables.map((varId) => (
                  <Form.Item
                    key={varId}
                    label={
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>
                        {VARIABLE_LABEL_MAP[varId] || varId.replace(/_/g, ' ')}
                      </span>
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      value={tenantData[varId] || ''}
                      onChange={(e) =>
                        setTenantData((prev) => ({ ...prev, [varId]: e.target.value }))
                      }
                      placeholder={VARIABLE_LABEL_MAP[varId] || varId.replace(/_/g, ' ')}
                      style={{ fontSize: 12 }}
                      suffix={
                        tenantData[varId]?.trim() ? (
                          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 11 }} />
                        ) : undefined
                      }
                    />
                  </Form.Item>
                ))}
              </Form>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT EDITOR ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#e5e7eb',
        }}
      >
        {!selectedTemplate ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty
              description={
                <Text type="secondary">
                  Select a template from the left to preview the document
                </Text>
              }
            />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <StyleToolbar editor={editor} onInsertVariable={() => setVariableDrawerOpen(true)} />
            </div>

            {/* Editor canvas */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
              <div
                style={{
                  maxWidth: 794,
                  margin: '0 auto',
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                  borderRadius: 4,
                }}
              >
                <EditorContent
                  editor={editor}
                  style={{ padding: '64px 72px', minHeight: 1000 }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Variable picker drawer */}
      <Drawer
        title="Insert Variable"
        placement="right"
        open={variableDrawerOpen}
        onClose={() => setVariableDrawerOpen(false)}
        width={280}
        getContainer={false}
      >
        <VariablePicker editor={editor} />
      </Drawer>

      <style>{`
        .ant-modal .ProseMirror {
          outline: none;
          font-size: 14px;
          line-height: 1.8;
          color: #1f2937;
          min-height: 600px;
        }
        .ant-modal .ProseMirror h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        .ant-modal .ProseMirror h2 { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
        .ant-modal .ProseMirror h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .ant-modal .ProseMirror p { margin-bottom: 10px; }
        .ant-modal .ProseMirror table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        .ant-modal .ProseMirror td, .ant-modal .ProseMirror th {
          border: 1px solid #d9d9d9;
          padding: 6px 10px;
          min-width: 60px;
        }
        .ant-modal .ProseMirror th { background: #fafafa; font-weight: 600; }
        .ant-modal .ProseMirror ul { padding-left: 20px; margin-bottom: 10px; }
        .ant-modal .ProseMirror ol { padding-left: 20px; margin-bottom: 10px; }
        @media print {
          .no-print { display: none !important; }
          .ant-modal-header, .ant-modal-footer { display: none !important; }
          .ant-modal-body > div:first-child { display: none !important; }
        }
      `}</style>
    </Modal>
  );
};

export default LeaseDocumentModal;
