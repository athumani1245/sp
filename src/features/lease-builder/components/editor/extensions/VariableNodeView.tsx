import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

const VariableNodeView: React.FC<NodeViewProps> = ({ node, selected }) => {
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
          fontWeight: 500,
          fontFamily: 'monospace',
          cursor: 'default',
          userSelect: 'none',
          lineHeight: '20px',
        }}
      >
        {`{{ ${node.attrs.label} }}`}
      </span>
    </NodeViewWrapper>
  );
};

export default VariableNodeView;
