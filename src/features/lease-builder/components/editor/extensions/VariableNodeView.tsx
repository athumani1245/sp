import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

function marksToStyle(marks: any[] = []): React.CSSProperties {
  const s: React.CSSProperties = {};
  marks.forEach((m) => {
    if (m.type === 'bold')      s.fontWeight = 'bold';
    if (m.type === 'italic')    s.fontStyle  = 'italic';
    if (m.type === 'underline') s.textDecoration = 'underline';
    if (m.type === 'strike')    s.textDecoration = 'line-through';
    if (m.type === 'textStyle') {
      if (m.attrs?.fontSize)   s.fontSize   = m.attrs.fontSize;
      if (m.attrs?.fontFamily) s.fontFamily = m.attrs.fontFamily;
      // Don't override chip foreground color with mark color — keep amber readable
    }
  });
  return s;
}

const VariableNodeView: React.FC<NodeViewProps> = ({ node, selected }) => {
  const markStyle = marksToStyle(node.marks as any[] | undefined);

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '1px 8px',
          borderRadius: 4,
          background: selected ? '#f59e0b' : '#fef3c7',
          color: '#92400e',
          border: `1px solid ${selected ? '#d97706' : '#fcd34d'}`,
          fontSize: 13,
          cursor: 'default',
          userSelect: 'none',
          lineHeight: '20px',
          ...markStyle,
        }}
      >
        {`[ ${node.attrs.label} ]`}
      </span>
    </NodeViewWrapper>
  );
};

export default VariableNodeView;
