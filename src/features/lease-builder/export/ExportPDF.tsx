import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

const BASE_SIZE = 11;

const page = StyleSheet.create({
  root: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingLeft: 72,
    paddingRight: 72,
    fontSize: BASE_SIZE,
    fontFamily: 'Helvetica',
    lineHeight: 1.7,
    color: '#1f2937',
  },
});

// ── Font family mapping: web names → built-in PDF fonts ──────────────────────
function mapFont(family: string): string {
  if (!family) return 'Helvetica';
  const f = family.toLowerCase();
  if (f.includes('times') || f.includes('georgia')) return 'Times-Roman';
  if (f.includes('courier') || f.includes('mono')) return 'Courier';
  return 'Helvetica';
}

// ── px / rem / pt → pt number ────────────────────────────────────────────────
function toPt(value: string | number): number {
  if (typeof value === 'number') return value;
  const n = parseFloat(value);
  if (isNaN(n)) return BASE_SIZE;
  if (value.endsWith('pt')) return n;
  if (value.endsWith('rem')) return Math.round(n * 12);
  return Math.round(n * 0.75); // px → pt
}

// ── Build style from TipTap inline marks ─────────────────────────────────────
function inlineStyle(marks: any[] = []): Record<string, any> {
  const s: Record<string, any> = {};
  (marks as any[]).forEach((m) => {
    switch (m.type) {
      case 'bold':      s.fontWeight = 'bold'; break;
      case 'italic':    s.fontStyle = 'italic'; break;
      case 'underline': s.textDecoration = 'underline'; break;
      case 'strike':    s.textDecoration = 'line-through'; break;
      case 'textStyle':
        if (m.attrs?.color) s.color = m.attrs.color;
        if (m.attrs?.fontSize) s.fontSize = toPt(m.attrs.fontSize);
        if (m.attrs?.fontFamily) s.fontFamily = mapFont(m.attrs.fontFamily);
        break;
    }
  });
  return s;
}

// ── textAlign from node attrs ─────────────────────────────────────────────────
type Align = 'left' | 'center' | 'right' | 'justify';
function align(node: any): Align {
  const a = node?.attrs?.textAlign;
  if (a === 'center' || a === 'right' || a === 'justify') return a;
  return 'left';
}

// ── Resolve variable — empty string when no value ─────────────────────────────
function resolveVar(id: string, data: Record<string, string>): string {
  return data[id] ?? '';
}

// ── Render inline content as nested <Text> — preserves all mark styles ────────
function InlineNodes({
  content,
  data,
}: {
  content: any[];
  data: Record<string, string>;
}): React.ReactElement {
  if (!content?.length) return <Text>{' '}</Text>;

  return (
    <>
      {content.map((node, i) => {
        if (node.type === 'text') {
          const s = inlineStyle(node.marks);
          return (
            <Text key={i} style={Object.keys(s).length ? s : undefined}>
              {node.text ?? ''}
            </Text>
          );
        }
        if (node.type === 'variableNode') {
          const s = inlineStyle(node.marks || []);
          return (
            <Text key={i} style={Object.keys(s).length ? s : undefined}>
              {resolveVar(node.attrs?.id, data)}
            </Text>
          );
        }
        if (node.type === 'hardBreak') {
          return <Text key={i}>{'\n'}</Text>;
        }
        return null;
      })}
    </>
  );
}

// ── Render a block node ───────────────────────────────────────────────────────
function BlockNode({
  node,
  data,
  index,
}: {
  node: any;
  data: Record<string, string>;
  index: number;
}): React.ReactElement | null {
  switch (node.type) {
    /* ── Headings ── */
    case 'heading': {
      const level: number = node.attrs?.level || 1;
      const sizes: Record<number, number> = { 1: 20, 2: 16, 3: 13, 4: 12 };
      return (
        <Text
          key={index}
          style={{
            fontSize: sizes[level] ?? 12,
            fontWeight: 'bold',
            textAlign: align(node),
            marginBottom: level <= 2 ? 12 : 8,
            marginTop: level === 1 ? 0 : 6,
          }}
        >
          <InlineNodes content={node.content ?? []} data={data} />
        </Text>
      );
    }

    /* ── Paragraph ── */
    case 'paragraph':
      return (
        <Text
          key={index}
          style={{ textAlign: align(node), marginBottom: 8, lineHeight: 1.7 }}
        >
          <InlineNodes content={node.content ?? []} data={data} />
        </Text>
      );

    /* ── Bullet list ── */
    case 'bulletList':
      return (
        <View key={index} style={{ marginBottom: 8 }}>
          {(node.content ?? []).map((li: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={{ width: 14 }}>{'•'}</Text>
              <Text style={{ flex: 1 }}>
                <InlineNodes content={li.content?.[0]?.content ?? []} data={data} />
              </Text>
            </View>
          ))}
        </View>
      );

    /* ── Ordered list ── */
    case 'orderedList':
      return (
        <View key={index} style={{ marginBottom: 8 }}>
          {(node.content ?? []).map((li: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={{ width: 18 }}>{`${i + 1}.`}</Text>
              <Text style={{ flex: 1 }}>
                <InlineNodes content={li.content?.[0]?.content ?? []} data={data} />
              </Text>
            </View>
          ))}
        </View>
      );

    /* ── Table ── */
    case 'table': {
      const rows: any[] = node.content ?? [];
      return (
        <View key={index} style={{ borderWidth: 1, borderColor: '#d9d9d9', marginBottom: 12 }}>
          {rows.map((row: any, ri: number) => {
            const cells: any[] = row.content ?? [];
            return (
              <View
                key={ri}
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: ri < rows.length - 1 ? 1 : 0,
                  borderBottomColor: '#d9d9d9',
                }}
              >
                {cells.map((cell: any, ci: number) => {
                  const isHeader = cell.type === 'tableHeader';
                  return (
                    <View
                      key={ci}
                      style={{
                        flex: 1,
                        padding: '5 8',
                        borderRightWidth: ci < cells.length - 1 ? 1 : 0,
                        borderRightColor: '#d9d9d9',
                        backgroundColor: isHeader ? '#f5f5f5' : undefined,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: isHeader ? 'bold' : 'normal' }}>
                        <InlineNodes
                          content={cell.content?.[0]?.content ?? []}
                          data={data}
                        />
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      );
    }

    /* ── Blockquote ── */
    case 'blockquote':
      return (
        <View
          key={index}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: '#d1d5db',
            paddingLeft: 10,
            marginBottom: 8,
          }}
        >
          {(node.content ?? []).map((child: any, i: number) => (
            <BlockNode key={i} node={child} data={data} index={i} />
          ))}
        </View>
      );

    /* ── Horizontal rule ── */
    case 'horizontalRule':
      return (
        <View
          key={index}
          style={{ borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginVertical: 12 }}
        />
      );

    default:
      return null;
  }
}

// ── Document component ────────────────────────────────────────────────────────
interface ExportDocProps {
  editorJson: any;
  tenantData: Record<string, string>;
}

const ExportDoc: React.FC<ExportDocProps> = ({ editorJson, tenantData }) => (
  <Document>
    <Page size="A4" style={page.root}>
      {(editorJson?.content ?? []).map((node: any, i: number) => (
        <BlockNode key={i} node={node} data={tenantData} index={i} />
      ))}
    </Page>
  </Document>
);

// ── Public export function ────────────────────────────────────────────────────
export async function exportToPDF(
  editorJson: any,
  tenantData: Record<string, string>,
  templateName: string,
) {
  const blob = await pdf(
    <ExportDoc editorJson={editorJson} tenantData={tenantData} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(templateName || 'lease').replace(/[^a-zA-Z0-9_\-. ]/g, '_')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
