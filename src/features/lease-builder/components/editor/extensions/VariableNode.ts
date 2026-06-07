import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VariableNodeView from './VariableNodeView'; // eslint-disable-line @typescript-eslint/no-explicit-any

export const VariableNode = Node.create({
  name: 'variableNode',
  group: 'inline',
  inline: true,
  atom: true,
  marks: '_', // allow all marks so bold/italic/font/color apply to the chip

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-variable]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-variable': true })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableNodeView as any);
  },
});
