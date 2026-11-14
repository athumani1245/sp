import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Space, Typography, Upload, theme } from 'antd';
import type { UploadFile } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Round photo picker; keeps the single selected file as a one-item UploadFile list.
interface TenantPhotoInputProps {
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
  /** Photo already saved on the tenant; shown until a new file is picked. */
  currentUrl?: string;
}

const TenantPhotoInput: React.FC<TenantPhotoInputProps> = ({ value = [], onChange, currentUrl }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const file = value[0]?.originFileObj;
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <Space orientation="vertical" align="center" size={4} style={{ width: '100%' }}>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={() => false}
        onChange={({ fileList }) => onChange?.(fileList.slice(-1))}
      >
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Avatar size={80} src={preview || currentUrl} icon={<UserOutlined />} style={{ backgroundColor: token.colorFillSecondary, color: token.colorTextTertiary }} />
          <span
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: token.colorPrimary,
              color: token.colorWhite,
              border: `2px solid ${token.colorBgContainer}`,
            }}
          >
            <CameraOutlined />
          </span>
        </div>
      </Upload>
      <Text strong style={{ marginTop: 8 }}>{t('tenants:addTenantModal.attachment')}</Text>
      {file ? (
        <Button type="link" size="small" danger style={{ padding: 0, height: 'auto' }} onClick={() => onChange?.([])}>
          {t('tenants:addTenantModal.remove')}
        </Button>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>{t('tenants:addTenantModal.photoHint')}</Text>
      )}
    </Space>
  );
};

export default TenantPhotoInput;
