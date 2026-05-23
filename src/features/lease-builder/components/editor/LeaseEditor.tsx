import React, { useEffect, useRef } from 'react';
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
import { VariableNode } from './extensions/VariableNode';
import { extractVariables } from '../../utils/extractVariables';
import { useDocumentStore } from '../../store/documentStore';

const extensions = [
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
  onEditorReady?: (editor: any) => void;
}

const LeaseEditor: React.FC<Props> = ({ onEditorReady }) => {
  const { editorJson, setEditorJson, setVariables } = useDocumentStore();

  // Track JSON produced by the editor itself so we can ignore those in the sync effect
  const internalJsonRef = useRef<any>(null);

  const editor = useEditor({
    extensions,
    content: editorJson || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      internalJsonRef.current = json;
      setEditorJson(json);
      setVariables(extractVariables(json));
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  // Sync externally-set editorJson into the editor (e.g. when a template loads)
  useEffect(() => {
    if (!editor || !editorJson) return;
    // Skip if this JSON was just produced by the editor itself
    if (internalJsonRef.current === editorJson) return;
    editor.commands.setContent(editorJson);
    internalJsonRef.current = editorJson;
  }, [editor, editorJson]);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        background: '#fff',
        borderRadius: '0 0 8px 8px',
        border: '1px solid #f0f0f0',
        borderTop: 'none',
      }}
    >
      <EditorContent
        editor={editor}
        style={{ minHeight: '100%', padding: '32px 48px' }}
      />
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 600px;
          font-size: 14px;
          line-height: 1.8;
          color: #1f2937;
        }
        .ProseMirror h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        .ProseMirror h2 { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
        .ProseMirror h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .ProseMirror p { margin-bottom: 10px; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        .ProseMirror td, .ProseMirror th {
          border: 1px solid #d9d9d9;
          padding: 6px 10px;
          min-width: 60px;
        }
        .ProseMirror th { background: #fafafa; font-weight: 600; }
        .ProseMirror ul { padding-left: 20px; margin-bottom: 10px; }
        .ProseMirror ol { padding-left: 20px; margin-bottom: 10px; }
        .ProseMirror .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: '';
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .ProseMirror .tableWrapper { overflow-x: auto; }
      `}</style>
    </div>
  );
};

export default LeaseEditor;
