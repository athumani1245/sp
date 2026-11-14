import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Image, Space, Tooltip, Typography, Upload, theme } from 'antd';
import { CameraOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useUpdateTenantPhoto } from '../../hooks/useTenants';

const { Text } = Typography;

const SIZE = 96;

interface TenantPhotoEditorProps {
  tenantId: string;
  /** Photo currently saved on the tenant, if any. */
  currentUrl?: string;
  currentAlt?: string;
}

/**
 * Self-contained tenant photo editor, independent of the tenant details form.
 * Hovering the photo reveals Change / Remove; the pending change is previewed
 * and only sent to the backend when the user clicks Save.
 */
const TenantPhotoEditor: React.FC<TenantPhotoEditorProps> = ({ tenantId, currentUrl, currentAlt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const updatePhoto = useUpdateTenantPhoto();

  // null = no pending change, File = replace, 'remove' = clear the photo
  const [pending, setPending] = useState<File | 'remove' | null>(null);

  const previewUrl = useMemo(() => (pending instanceof File ? URL.createObjectURL(pending) : undefined), [pending]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const shownUrl = pending === 'remove' ? undefined : previewUrl || currentUrl;
  const hasPhoto = !!shownUrl;

  const handleSave = async () => {
    if (!pending) return;
    try {
      await updatePhoto.mutateAsync({ tenantId, photo: pending === 'remove' ? null : pending });
      setPending(null);
    } catch {
      // Error message is shown by the mutation
    }
  };

  return (
    <Space orientation="vertical" align="center" size={8} style={{ width: '100%' }}>
      <style>{`
        .tenant-photo-editor { position: relative; width: ${SIZE}px; height: ${SIZE}px; border-radius: 50%; }
        .tenant-photo-editor__overlay {
          position: absolute; inset: 0; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0; transition: opacity 0.2s;
        }
        .tenant-photo-editor:hover .tenant-photo-editor__overlay,
        .tenant-photo-editor:focus-within .tenant-photo-editor__overlay { opacity: 1; }
        /* Touch screens have no hover, so keep the controls visible there */
        @media (hover: none) { .tenant-photo-editor__overlay { opacity: 1; background: rgba(0, 0, 0, 0.35); } }
      `}</style>

      <div className="tenant-photo-editor">
        {hasPhoto ? (
          <Image
            src={shownUrl}
            alt={currentAlt}
            width={SIZE}
            height={SIZE}
            preview={false}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <Avatar
            size={SIZE}
            icon={<UserOutlined />}
            style={{ backgroundColor: token.colorFillSecondary, color: token.colorTextTertiary }}
          />
        )}

        <div className="tenant-photo-editor__overlay">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              setPending(file);
              return false; // keep it local until Save
            }}
            disabled={updatePhoto.isPending}
          >
            <Tooltip title={hasPhoto ? t('tenants:tenantDetail.changePhoto') : t('tenants:tenantDetail.attachPhoto')}>
              <Button shape="circle" size="small" icon={<CameraOutlined />} aria-label={t('tenants:tenantDetail.changePhoto')} />
            </Tooltip>
          </Upload>
          {hasPhoto && (
            <Tooltip title={t('tenants:tenantDetail.removePhoto')}>
              <Button
                shape="circle"
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label={t('tenants:tenantDetail.removePhoto')}
                disabled={updatePhoto.isPending}
                onClick={() => setPending(currentUrl ? 'remove' : null)}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <Text strong>{t('tenants:addTenantModal.attachment')}</Text>

      {pending ? (
        <Space size={8}>
          <Button size="small" icon={<CloseOutlined />} onClick={() => setPending(null)} disabled={updatePhoto.isPending}>
            {t('tenants:tenantDetail.cancel')}
          </Button>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={handleSave} loading={updatePhoto.isPending}>
            {t('tenants:tenantDetail.savePhoto')}
          </Button>
        </Space>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>{t('tenants:tenantDetail.photoHoverHint')}</Text>
      )}
    </Space>
  );
};

export default TenantPhotoEditor;
