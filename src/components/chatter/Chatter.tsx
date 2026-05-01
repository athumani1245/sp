import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Upload,
  Button,
  List,
  Typography,
  Space,
  Modal,
  Tooltip,
  Empty,
  Skeleton,
  Tag,
  Input,
  Avatar,
  Divider,
  DatePicker,
  Select,
  Image,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';
import {
  PaperClipOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FormOutlined,
  SendOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../../hooks/useAttachments';
import { useNotes, useCreateNote, useDeleteNote } from '../../hooks/useNotes';
import type { Attachment } from '../../services/attachmentService';
import type { Note, NoteType } from '../../services/noteService';

const { Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

interface ChatterProps {
  model: string;
  recordId: string;
}

// ── Helpers ──

const getFileIcon = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  const iconStyle = { fontSize: 20 };
  if (['pdf'].includes(ext)) return <FilePdfOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return <FileImageOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileExcelOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
  if (['doc', 'docx'].includes(ext)) return <FileWordOutlined style={{ ...iconStyle, color: '#2f54eb' }} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileZipOutlined style={{ ...iconStyle, color: '#faad14' }} />;
  return <FileOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
};

const isImageFile = (fileName: string, fileUrl?: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return true;
  if (fileUrl && /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(fileUrl)) return true;
  return false;
};

const isPdfFile = (fileName: string) => {
  return fileName?.split('.').pop()?.toLowerCase() === 'pdf';
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const formatDateGroup = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getRelativeTime = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return '';
  } catch {
    return '';
  }
};

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '?';
};

const avatarColors = ['#CC5B4B', '#7265e6', '#f56a00', '#00a2ae', '#87d068', '#108ee9'];
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// ── Component ──

const Chatter: React.FC<ChatterProps> = ({ model, recordId }) => {
  const { t } = useTranslation();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteDate, setNoteDate] = useState<dayjs.Dayjs>(dayjs());
  const [noteType, setNoteType] = useState<NoteType>('GENERAL');

  // Attachments
  const { data: attachments, isLoading: attachmentsLoading } = useAttachments(model, recordId);
  const uploadMutation = useUploadAttachment(model, recordId);
  const deleteMutation = useDeleteAttachment(model, recordId);
  const attachmentList: Attachment[] = Array.isArray(attachments) ? attachments : [];

  // Notes
  const { data: notes, isLoading: notesLoading } = useNotes(model, recordId);
  const createNoteMutation = useCreateNote(model, recordId);
  const deleteNoteMutation = useDeleteNote(model, recordId);
  const noteList: Note[] = Array.isArray(notes) ? notes : [];

  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    const sorted = [...noteList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    sorted.forEach((note) => {
      const dateKey = new Date(note.created_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(note);
    });
    return groups;
  }, [noteList]);

  // ── Handlers ──

  const handleUpload: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options;
    uploadMutation.mutate(file as File, {
      onSuccess: () => onSuccess?.({}),
      onError: (err) => onError?.(err as Error),
    });
  };

  const handleDeleteAttachment = (attachment: Attachment) => {
    confirm({
      title: t('chatter:chatter.deleteFile'),
      icon: <ExclamationCircleOutlined />,
      content: t('chatter:chatter.deleteFileConfirm', { name: attachment.file_name }),
      okText: t('chatter:chatter.yes'),
      okType: 'danger',
      cancelText: t('chatter:chatter.cancel'),
      onOk() {
        deleteMutation.mutate(attachment.id);
      },
    });
  };

  const handleDownload = (attachment: Attachment) => {
    if (attachment.file) {
      window.open(attachment.file, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmitNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    createNoteMutation.mutate(
      {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        date: noteDate.format('YYYY-MM-DD'),
        note_type: noteType,
        model: model,
        object_id: recordId,
      },
      {
        onSuccess: () => {
          setNoteTitle('');
          setNoteContent('');
          setNoteDate(dayjs());
          setNoteType('GENERAL');
          setShowNoteInput(false);
        },
      }
    );
  };

  const handleDeleteNote = (note: Note) => {
    confirm({
      title: t('chatter:chatter.deleteNote'),
      icon: <ExclamationCircleOutlined />,
      content: t('chatter:chatter.deleteNoteConfirm'),
      okText: t('chatter:chatter.yes'),
      okType: 'danger',
      cancelText: t('chatter:chatter.cancel'),
      onOk() {
        deleteNoteMutation.mutate(note.id);
      },
    });
  };

  // ── Render ──

  return (
    <>
    <Card
      style={{ marginTop: 16 }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <Button
          type={showNoteInput ? 'primary' : 'default'}
          icon={<FormOutlined />}
          onClick={() => setShowNoteInput(true)}
          style={showNoteInput ? { backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' } : {}}
        >
          {t('chatter:chatter.logNote')}
        </Button>
      </div>

      {/* Note input area */}
      {showNoteInput && (
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder={t('chatter:chatter.noteTitle')}
              style={{ flex: 1, minWidth: 180 }}
            />
            <DatePicker
              value={noteDate}
              onChange={(date) => date && setNoteDate(date)}
              format="YYYY-MM-DD"
              style={{ width: 160 }}
              allowClear={false}
            />
            <Select
              value={noteType}
              onChange={(val) => setNoteType(val)}
              style={{ width: 140 }}
              options={[
                { label: t('chatter:chatter.typeGeneral'), value: 'GENERAL' },
                { label: t('chatter:chatter.typeReminder'), value: 'REMINDER' },
                { label: t('chatter:chatter.typeWarning'), value: 'WARNING' },
                { label: t('chatter:chatter.typeInfo'), value: 'INFO' },
              ]}
            />
          </div>
          <TextArea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t('chatter:chatter.notePlaceholder')}
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ marginBottom: 12 }}
          />
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmitNote}
              loading={createNoteMutation.isPending}
              disabled={!noteTitle.trim() || !noteContent.trim()}
              style={{ backgroundColor: '#CC5B4B', borderColor: '#CC5B4B' }}
            >
              {t('chatter:chatter.addNote')}
            </Button>
            <Button
              onClick={() => {
                setShowNoteInput(false);
                setNoteTitle('');
                setNoteContent('');
                setNoteDate(dayjs());
                setNoteType('GENERAL');
              }}
            >
              {t('chatter:chatter.cancel')}
            </Button>
          </Space>
        </div>
      )}

      {/* ── Files section (always visible at top) ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('chatter:chatter.attachments')}
          {attachmentList.length > 0 && (
            <span style={{ marginLeft: 6, fontWeight: 400, color: '#bfbfbf' }}>({attachmentList.length})</span>
          )}
        </Text>

        {attachmentsLoading ? (
          <div style={{ marginTop: 12 }}>
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </div>
        ) : (
          <>
            {attachmentList.length > 0 && (
              <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
                {attachmentList.map((attachment) => {
                  const isImage = isImageFile(attachment.file_name, attachment.file);
                  return (
                    <Col xs={12} key={attachment.id}>
                      <Card
                        size="small"
                        hoverable
                        bodyStyle={{ padding: 0 }}
                        style={{ borderRadius: 8, overflow: 'hidden' }}
                        cover={
                          isImage ? (
                            <div style={{ height: 90, overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image
                                src={attachment.file}
                                alt={attachment.file_name}
                                style={{ objectFit: 'cover', width: '100%', height: 90 }}
                                preview={{ mask: t('chatter:chatter.preview') || 'Preview' }}
                              />
                            </div>
                          ) : isPdfFile(attachment.file_name) ? (
                            <div
                              style={{
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fff1f0',
                                cursor: 'pointer',
                              }}
                              onClick={() => setPdfPreview({ url: attachment.file, name: attachment.file_name })}
                            >
                              <span style={{ fontSize: 36 }}>{getFileIcon(attachment.file_name)}</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fafafa',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleDownload(attachment)}
                            >
                              <span style={{ fontSize: 36 }}>{getFileIcon(attachment.file_name)}</span>
                            </div>
                          )
                        }
                      >
                        <div style={{ padding: '6px 8px' }}>
                          <Tooltip title={attachment.file_name}>
                            <Text ellipsis style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                              {attachment.file_name}
                            </Text>
                          </Tooltip>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {isPdfFile(attachment.file_name) && (
                              <Tooltip title={t('chatter:chatter.preview') || 'Preview'}>
                                <Button type="text" size="small" icon={<EyeOutlined style={{ fontSize: 12 }} />} onClick={() => setPdfPreview({ url: attachment.file, name: attachment.file_name })} />
                              </Tooltip>
                            )}
                            <Tooltip title={t('chatter:chatter.download')}>
                              <Button type="text" size="small" icon={<DownloadOutlined style={{ fontSize: 12 }} />} onClick={() => handleDownload(attachment)} />
                            </Tooltip>
                            <Tooltip title={t('chatter:chatter.delete')}>
                              <Button type="text" danger size="small" icon={<DeleteOutlined style={{ fontSize: 12 }} />} onClick={() => handleDeleteAttachment(attachment)} loading={deleteMutation.isPending} />
                            </Tooltip>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}

            {/* Attach files button */}
            <Upload customRequest={handleUpload} showUploadList={false} multiple>
              <Button
                type="link"
                icon={<UploadOutlined />}
                loading={uploadMutation.isPending}
                style={{ padding: '4px 0', marginTop: 8, color: '#CC5B4B' }}
                size="small"
              >
                {uploadMutation.isPending ? t('chatter:chatter.uploading') : t('chatter:chatter.uploadFiles')}
              </Button>
            </Upload>
          </>
        )}
      </div>

      {/* ── Notes / Activity feed ── */}
      <div style={{ padding: 16 }}>
        {notesLoading ? (
          <div>
            <Skeleton active avatar paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </div>
        ) : noteList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('chatter:chatter.noNotes')} />
        ) : (
          Object.entries(groupedNotes).map(([dateKey, dateNotes]) => (
            <div key={dateKey}>
              <Divider style={{ margin: '12px 0', fontSize: 13, color: '#8c8c8c' }}>
                {formatDateGroup(dateNotes[0].created_at)}
              </Divider>

              {dateNotes.map((note) => {
                const authorName = note.author
                  ? `${note.author.first_name} ${note.author.last_name}`
                  : '';
                const relative = getRelativeTime(note.created_at);
                const noteTypeColor: Record<string, string> = {
                  GENERAL: 'default',
                  REMINDER: 'orange',
                  WARNING: 'red',
                  INFO: 'blue',
                };

                return (
                  <div key={note.id} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '8px 0' }}>
                    <Avatar
                      style={{
                        backgroundColor: note.author ? getAvatarColor(authorName) : '#f0f0f0',
                        flexShrink: 0,
                        color: note.author ? '#fff' : '#8c8c8c',
                      }}
                      size={36}
                    >
                      {note.author ? getInitials(note.author.first_name, note.author.last_name) : <UserOutlined />}
                    </Avatar>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 14 }}>{authorName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          - {relative || formatDateTime(note.created_at)}
                        </Text>
                        {note.note_type && (
                          <Tag color={noteTypeColor[note.note_type] || 'default'} style={{ marginLeft: 0 }}>
                            {t(`chatter:chatter.type${note.note_type.charAt(0)}${note.note_type.slice(1).toLowerCase()}`)}
                          </Tag>
                        )}
                        {note.date && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {note.date}
                          </Text>
                        )}
                        <Tooltip title={t('chatter:chatter.delete')}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteNote(note)}
                            style={{ marginLeft: 'auto', opacity: 0.5 }}
                          />
                        </Tooltip>
                      </div>
                      {note.title && (
                        <Text strong style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
                          {note.title}
                        </Text>
                      )}
                      <div
                        style={{
                          marginTop: 4,
                          padding: '8px 12px',
                          background: '#f9f9f9',
                          borderRadius: 6,
                          borderLeft: '3px solid #CC5B4B',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: 14,
                          lineHeight: 1.6,
                        }}
                      >
                        {note.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </Card>

    {/* ── PDF Preview Modal ── */}
    {pdfPreview && (
      <Modal
        open
        title={pdfPreview.name}
        onCancel={() => setPdfPreview(null)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => window.open(pdfPreview.url, '_blank', 'noopener,noreferrer')}>
            {t('chatter:chatter.download')}
          </Button>,
          <Button key="close" onClick={() => setPdfPreview(null)}>
            {t('chatter:chatter.cancel')}
          </Button>,
        ]}
        width="80vw"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: '80vh' }}
        destroyOnClose
      >
        <iframe
          src={pdfPreview.url}
          title={pdfPreview.name}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </Modal>
    )}
    </>
  );
};

export default Chatter;
