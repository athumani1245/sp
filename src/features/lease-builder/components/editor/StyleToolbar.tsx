import React, { useState } from 'react';
import { Button, Select, Tooltip, Divider, Space, Popover } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  TableOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { Editor } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  onInsertVariable: () => void;
}

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
];

const FONT_SIZES = ['10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const HEADING_OPTIONS = [
  { label: 'Normal', value: 0 },
  { label: 'Heading 1', value: 1 },
  { label: 'Heading 2', value: 2 },
  { label: 'Heading 3', value: 3 },
];

const COLORS = [
  '#000000', '#CC5B4B', '#1677ff', '#52c41a', '#faad14',
  '#f5222d', '#722ed1', '#13c2c2', '#595959', '#8c8c8c',
];

const StyleToolbar: React.FC<Props> = ({ editor, onInsertVariable }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  if (!editor) return null;

  const btn = (
    active: boolean,
    icon: React.ReactNode,
    title: string,
    onClick: () => void
  ) => (
    <Tooltip title={title} key={title}>
      <Button
        size="small"
        type={active ? 'primary' : 'text'}
        icon={icon}
        onClick={onClick}
        style={{ minWidth: 28 }}
      />
    </Tooltip>
  );

  const colorPicker = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, width: 140 }}>
      {COLORS.map((c) => (
        <div
          key={c}
          onClick={() => { editor.chain().focus().setColor(c).run(); setColorPickerOpen(false); }}
          style={{
            width: 20, height: 20, borderRadius: 3, background: c,
            cursor: 'pointer', border: '1px solid #d9d9d9',
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        padding: '6px 8px',
        background: '#fafafa',
        borderBottom: '1px solid #f0f0f0',
        borderRadius: '8px 8px 0 0',
      }}
    >
      {/* Heading */}
      <Select
        size="small"
        style={{ width: 110 }}
        value={
          editor.isActive('heading', { level: 1 }) ? 1
          : editor.isActive('heading', { level: 2 }) ? 2
          : editor.isActive('heading', { level: 3 }) ? 3
          : 0
        }
        onChange={(val) => {
          if (val === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: val as 1 | 2 | 3 }).run();
        }}
        options={HEADING_OPTIONS}
      />

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Font family */}
      <Select
        size="small"
        style={{ width: 130 }}
        placeholder="Font"
        onChange={(val) => {
          if (!val) editor.chain().focus().unsetFontFamily().run();
          else editor.chain().focus().setFontFamily(val).run();
        }}
        options={FONT_FAMILIES}
      />

      {/* Font size */}
      <Select
        size="small"
        style={{ width: 74 }}
        placeholder="Size"
        onChange={(val) =>
          editor.chain().focus().setMark('textStyle', { fontSize: val }).run()
        }
        options={FONT_SIZES.map((s) => ({ label: s, value: s }))}
      />

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Format */}
      {btn(editor.isActive('bold'), <BoldOutlined />, 'Bold', () => editor.chain().focus().toggleBold().run())}
      {btn(editor.isActive('italic'), <ItalicOutlined />, 'Italic', () => editor.chain().focus().toggleItalic().run())}
      {btn(editor.isActive('underline'), <UnderlineOutlined />, 'Underline', () => editor.chain().focus().toggleUnderline().run())}
      {btn(editor.isActive('strike'), <StrikethroughOutlined />, 'Strikethrough', () => editor.chain().focus().toggleStrike().run())}

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Color */}
      <Popover
        content={colorPicker}
        trigger="click"
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
      >
        <Tooltip title="Text Color">
          <Button
            size="small"
            type="text"
            style={{ minWidth: 28 }}
            icon={
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 2,
                  background: editor.getAttributes('textStyle').color || '#000',
                  border: '1px solid #d9d9d9',
                }}
              />
            }
          />
        </Tooltip>
      </Popover>

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Alignment */}
      {btn(editor.isActive({ textAlign: 'left' }), <AlignLeftOutlined />, 'Align Left', () => editor.chain().focus().setTextAlign('left').run())}
      {btn(editor.isActive({ textAlign: 'center' }), <AlignCenterOutlined />, 'Align Center', () => editor.chain().focus().setTextAlign('center').run())}
      {btn(editor.isActive({ textAlign: 'right' }), <AlignRightOutlined />, 'Align Right', () => editor.chain().focus().setTextAlign('right').run())}
      {btn(editor.isActive({ textAlign: 'justify' }), <MenuOutlined />, 'Justify', () => editor.chain().focus().setTextAlign('justify').run())}

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Lists */}
      {btn(editor.isActive('bulletList'), <UnorderedListOutlined />, 'Bullet List', () => editor.chain().focus().toggleBulletList().run())}
      {btn(editor.isActive('orderedList'), <OrderedListOutlined />, 'Ordered List', () => editor.chain().focus().toggleOrderedList().run())}

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Table */}
      <Tooltip title="Insert Table">
        <Button
          size="small"
          type="text"
          icon={<TableOutlined />}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        />
      </Tooltip>

      <Divider type="vertical" style={{ margin: '0 2px' }} />

      {/* Variable */}
      <Button
        size="small"
        onClick={onInsertVariable}
        style={{
          background: '#fef3c7',
          borderColor: '#fcd34d',
          color: '#92400e',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {'{ } Variable'}
      </Button>
    </div>
  );
};

export default StyleToolbar;
