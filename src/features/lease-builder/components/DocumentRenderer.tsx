import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;


interface Props {
  editorJson: any | null;
  tenantData: Record<string, string>;
}


function renderMarks(text: string, marks: any[] = []) {
  let content: React.ReactNode = text;
  const style: React.CSSProperties = {};

  marks.forEach((mark) => {
    if (mark.type === 'bold') style.fontWeight = 'bold';
    if (mark.type === 'italic') style.fontStyle = 'italic';
    if (mark.type === 'underline') style.textDecoration = 'underline';
    if (mark.type === 'strike') style.textDecoration = 'line-through';
    if (mark.type === 'textStyle') {
      if (mark.attrs?.color) style.color = mark.attrs.color;
      if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize;
      if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily;
    }
  });

  if (Object.keys(style).length) {
    content = <span style={style}>{text}</span>;
  }
  return content;
}

function renderInline(node: any, tenantData: Record<string, string>, key: number): React.ReactNode {
  if (node.type === 'text') return <React.Fragment key={key}>{renderMarks(node.text, node.marks)}</React.Fragment>;
  if (node.type === 'variableNode') {
    const value = tenantData[node.attrs?.id];
    const hasValue = value !== undefined && value !== '';
    if (hasValue) {
      return <React.Fragment key={key}>{renderMarks(value, node.marks)}</React.Fragment>;
    }
    // Empty: show amber placeholder chip (no marks applied — chip has its own styling)
    return (
      <React.Fragment key={key}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 3,
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fcd34d',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {`[ ${node.attrs?.label || node.attrs?.id} ]`}
        </span>
      </React.Fragment>
    );
  }
  if (node.type === 'hardBreak') return <br key={key} />;
  return null;
}

function renderChildren(content: any[] = [], tenantData: Record<string, string>) {
  return content.map((node, i) => renderInline(node, tenantData, i));
}

function renderNode(node: any, tenantData: Record<string, string>, key: number): React.ReactNode {
  const align = node.attrs?.textAlign as string | undefined;
  const textAlign = align as React.CSSProperties['textAlign'];

  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1;
      const sizes: Record<number, number> = { 1: 22, 2: 18, 3: 15 };
      return (
        <div key={key} style={{
          fontSize: sizes[level] || 16,
          fontWeight: 700,
          marginBottom: level === 1 ? 16 : 12,
          textAlign,
        }}>
          {renderChildren(node.content, tenantData)}
        </div>
      );
    }
    case 'paragraph':
      return (
        <p key={key} style={{ marginBottom: 10, textAlign, lineHeight: 1.8 }}>
          {node.content?.length ? renderChildren(node.content, tenantData) : <br />}
        </p>
      );
    case 'bulletList':
      return (
        <ul key={key} style={{ paddingLeft: 20, marginBottom: 10 }}>
          {node.content?.map((li: any, i: number) => renderNode(li, tenantData, i))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} style={{ paddingLeft: 20, marginBottom: 10 }}>
          {node.content?.map((li: any, i: number) => renderNode(li, tenantData, i))}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key}>
          {node.content?.map((n: any, i: number) => renderNode(n, tenantData, i))}
        </li>
      );
    case 'table':
      return (
        <table key={key} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 12 }}>
          <tbody>
            {node.content?.map((row: any, i: number) => renderNode(row, tenantData, i))}
          </tbody>
        </table>
      );
    case 'tableRow':
      return (
        <tr key={key}>
          {node.content?.map((cell: any, i: number) => renderNode(cell, tenantData, i))}
        </tr>
      );
    case 'tableHeader':
      return (
        <th key={key} style={{ border: '1px solid #d9d9d9', padding: '6px 10px', background: '#fafafa', fontWeight: 600 }}>
          {renderChildren(node.content, tenantData)}
        </th>
      );
    case 'tableCell':
      return (
        <td key={key} style={{ border: '1px solid #d9d9d9', padding: '6px 10px' }}>
          {renderChildren(node.content, tenantData)}
        </td>
      );
    case 'horizontalRule':
      return <hr key={key} style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />;
    default:
      return null;
  }
}

const DocumentRenderer: React.FC<Props> = ({ editorJson, tenantData }) => {
  if (!editorJson) {
    return (
      <div style={{
        width: 794, minHeight: 1123, margin: '0 auto',
        background: '#fff', padding: '80px 80px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9ca3af', fontSize: 14,
      }}>
        <Text type="secondary">No content to preview.</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        margin: '0 auto',
        background: '#fff',
        padding: '80px 80px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: 14,
        lineHeight: 1.8,
        color: '#1f2937',
      }}
    >
      {editorJson.content?.map((node: any, i: number) => renderNode(node, tenantData, i))}
    </div>
  );
};

export default DocumentRenderer;
