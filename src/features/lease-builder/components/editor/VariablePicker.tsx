import React, { useState } from 'react';
import { Button, Input, Divider, Space, Typography, Skeleton, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Editor } from '@tiptap/react';
import { useLeaseVariables } from '../../hooks/useLeaseTemplates';
import type { LeaseVariable } from '../../services/leaseTemplateService';
import { LEASE_VARIABLES } from '../../utils/variableDefinitions';

const { Text } = Typography;

interface Props {
  editor: Editor | null;
}

const VariablePicker: React.FC<Props> = ({ editor }) => {
  const [custom, setCustom] = useState('');
  const [search, setSearch] = useState('');
  const { data: apiVariables, isLoading, isError } = useLeaseVariables();

  // Always show the full local list (proper labels + categories).
  // Append any extra keys the API returns that aren't already in the local list.
  const apiExtras = (apiVariables || []).filter(
    (v: LeaseVariable) => !LEASE_VARIABLES.some((l) => l.id === v.id),
  );
  const allVariables: LeaseVariable[] = [...LEASE_VARIABLES, ...apiExtras];

  const filtered = search.trim()
    ? allVariables.filter(
        (v) =>
          v.label.toLowerCase().includes(search.toLowerCase()) ||
          v.id.toLowerCase().includes(search.toLowerCase()),
      )
    : allVariables;

  // Group by category
  const groups: Record<string, LeaseVariable[]> = {};
  filtered.forEach((v) => {
    const cat = v.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(v);
  });

  const insertVariable = (id: string, label: string) => {
    if (!editor || !id.trim()) return;
    const normalizedId = id.trim().toLowerCase().replace(/\s+/g, '_');
    const displayLabel = label.trim() || normalizedId.replace(/_/g, ' ');

    // Collect whatever marks are active at the current cursor position so the
    // variable node inherits the surrounding text style (font, size, color, etc.)
    const activeMarks: any[] = [];
    if (editor.isActive('bold'))      activeMarks.push({ type: 'bold' });
    if (editor.isActive('italic'))    activeMarks.push({ type: 'italic' });
    if (editor.isActive('underline')) activeMarks.push({ type: 'underline' });
    if (editor.isActive('strike'))    activeMarks.push({ type: 'strike' });
    const ts = editor.getAttributes('textStyle');
    if (ts.color || ts.fontSize || ts.fontFamily) {
      activeMarks.push({ type: 'textStyle', attrs: ts });
    }

    editor.chain().focus().insertContent({
      type: 'variableNode',
      attrs: { id: normalizedId, label: displayLabel },
      ...(activeMarks.length ? { marks: activeMarks } : {}),
    }).run();
  };

  const VariableCard = ({ v }: { v: LeaseVariable }) => (
    <div
      onClick={() => insertVariable(v.id, v.label)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid #fcd34d',
        background: '#fef3c7',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#fde68a';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#f59e0b';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#fef3c7';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#fcd34d';
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 500, color: '#78350f', lineHeight: 1.4 }}>
        {v.label}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Text type="secondary" style={{ fontSize: 11, paddingBottom: 8, display: 'block' }}>
        Click a field to insert it at your cursor position.
      </Text>

      {/* Search */}
      <Input
        size="small"
        placeholder="Search fields..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 8 }}
      />

      {isError && (
        <Alert
          type="warning"
          message="Could not reach server. Showing default fields."
          style={{ fontSize: 11, padding: '4px 8px', marginBottom: 8 }}
          showIcon
        />
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton.Button key={i} active block size="small" style={{ height: 40, borderRadius: 6 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0', display: 'block' }}>
          No fields match "{search}"
        </Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {Object.entries(groups).map(([category, vars]) => (
            <div key={category} style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#6b7280',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'block',
                  padding: '6px 0 4px',
                }}
              >
                {category}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {vars.map((v) => <VariableCard key={v.id} v={v} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <Divider style={{ margin: '12px 0 8px' }}>Custom</Divider>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          size="small"
          placeholder="my_variable"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onPressEnter={() => { insertVariable(custom, custom); setCustom(''); }}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { insertVariable(custom, custom); setCustom(''); }}
          disabled={!custom.trim()}
        />
      </Space.Compact>
    </div>
  );
};

export default VariablePicker;
