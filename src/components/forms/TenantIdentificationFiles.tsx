import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Empty,
  List,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload,
  theme,
} from 'antd';
import {
  DeleteOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  ExportOutlined,
  PlusOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  useTenantIdentificationFiles,
  useReplaceTenantIdentificationFiles,
  useUpdateTenantIdentificationFile,
  useDeleteTenantIdentificationFile,
} from '../../hooks/useTenants';
import type { TenantIdentificationFile } from '../../services/tenantService';

const { Text, Link } = Typography;

const ACCEPT = 'image/*,.pdf';

type FileKind = 'pdf' | 'image' | 'other';

const fileKind = (file: { file_name: string; mime_type?: string }): FileKind => {
  const name = file.file_name.toLowerCase();
  const mime = (file.mime_type || '').toLowerCase();
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image') || /\.(png|jpe?g|gif|webp|bmp|heic)$/.test(name)) return 'image';
  return 'other';
};

const fileIcon = (file: { file_name: string; mime_type?: string }) => {
  const kind = fileKind(file);
  if (kind === 'pdf') return <FilePdfOutlined />;
  if (kind === 'image') return <FileImageOutlined />;
  return <FileOutlined />;
};

/**
 * Manages a tenant's ID files directly against the identification endpoints,
 * independently of the tenant details form.
 */
const TenantIdentificationFiles: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { data: files = [], isLoading } = useTenantIdentificationFiles(tenantId);
  const addFiles = useReplaceTenantIdentificationFiles();
  const updateOne = useUpdateTenantIdentificationFile();
  const deleteOne = useDeleteTenantIdentificationFile();

  // Which existing file a per-row request is running for
  const [busyId, setBusyId] = useState<string | null>(null);
  // File shown in the preview modal
  const [previewFile, setPreviewFile] = useState<TenantIdentificationFile | null>(null);

  const anyBusy = addFiles.isPending || !!busyId;

  const runForRow = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await action();
    } catch {
      // Error message is shown by the mutation
    } finally {
      setBusyId(null);
    }
  };

  // Only offered when the tenant has no ID files, so the PUT (replace-all) just adds them.
  const handleAdd = async (selected: File[]) => {
    try {
      await addFiles.mutateAsync({ tenantId, files: selected });
    } catch {
      // Error message is shown by the mutation
    }
  };

  const renderExisting = (file: TenantIdentificationFile) => {
    const rowBusy = busyId === file.id;

    return (
      <List.Item
        actions={[
          <Upload
            key="replace"
            accept={ACCEPT}
            showUploadList={false}
            disabled={anyBusy}
            beforeUpload={(newFile) => {
              runForRow(file.id, () => updateOne.mutateAsync({ tenantId, attachmentId: file.id, file: newFile }));
              return false;
            }}
          >
            <Tooltip title={t('tenants:tenantDetail.idFiles.replace')}>
              <Button size="small" type="text" icon={<SwapOutlined />} disabled={anyBusy} aria-label={t('tenants:tenantDetail.idFiles.replace')} />
            </Tooltip>
          </Upload>,
          <Popconfirm
            key="delete"
            title={t('tenants:tenantDetail.idFiles.deleteConfirm', { name: file.file_name })}
            okText={t('tenants:tenantDetail.idFiles.delete')}
            okButtonProps={{ danger: true }}
            cancelText={t('tenants:tenantDetail.cancel')}
            onConfirm={() => runForRow(file.id, () => deleteOne.mutateAsync({ tenantId, attachmentId: file.id }))}
            disabled={anyBusy}
          >
            <Tooltip title={t('tenants:tenantDetail.idFiles.delete')}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={anyBusy} aria-label={t('tenants:tenantDetail.idFiles.delete')} />
            </Tooltip>
          </Popconfirm>,
        ]}
      >
        <Spin spinning={rowBusy} size="small">
          <Space align="center" wrap>
            <span style={{ color: token.colorTextSecondary, fontSize: 18 }}>{fileIcon(file)}</span>
            {file.url ? (
              <Link onClick={() => setPreviewFile(file)}>{file.file_name}</Link>
            ) : (
              <Text>{file.file_name}</Text>
            )}
          </Space>
        </Spin>
      </List.Item>
    );
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Text strong>{t('tenants:addTenantModal.identificationFiles')}</Text>

      {isLoading ? (
        <Spin size="small" />
      ) : files.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('tenants:tenantDetail.idFiles.empty')} style={{ margin: 0 }}>
          <Upload
            accept={ACCEPT}
            multiple
            showUploadList={false}
            disabled={addFiles.isPending}
            beforeUpload={(file, batch) => {
              // Called once per selected file; send the whole selection in one request.
              if (file === batch[batch.length - 1]) handleAdd(batch);
              return false;
            }}
          >
            <Button type="primary" icon={<PlusOutlined />} loading={addFiles.isPending}>
              {t('tenants:tenantDetail.idFiles.add')}
            </Button>
          </Upload>
        </Empty>
      ) : (
        <List size="small" bordered dataSource={files} renderItem={renderExisting} />
      )}

      <Modal
        open={!!previewFile}
        title={previewFile?.file_name}
        onCancel={() => setPreviewFile(null)}
        width={previewFile && fileKind(previewFile) === 'pdf' ? 960 : 720}
        centered
        destroyOnHidden
        footer={[
          <Button key="open" icon={<ExportOutlined />} href={previewFile?.url} target="_blank" rel="noopener noreferrer">
            {t('tenants:tenantDetail.idFiles.openInNewTab')}
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewFile(null)}>
            {t('tenants:tenantDetail.idFiles.close')}
          </Button>,
        ]}
      >
        {previewFile && (() => {
          const kind = fileKind(previewFile);
          if (kind === 'image') {
            return (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={previewFile.url}
                  alt={previewFile.file_name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
            );
          }
          if (kind === 'pdf') {
            return (
              <iframe
                src={previewFile.url}
                title={previewFile.file_name}
                style={{ width: '100%', height: '70vh', border: 'none' }}
              />
            );
          }
          return (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('tenants:tenantDetail.idFiles.previewUnavailable')}
            />
          );
        })()}
      </Modal>
    </Space>
  );
};

export default TenantIdentificationFiles;
