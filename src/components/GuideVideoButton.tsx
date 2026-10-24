import React, { useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface GuideVideoButtonProps {
  url: string;
}

const getEmbedUrl = (url: string) => {
  const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const GuideVideoButton: React.FC<GuideVideoButtonProps> = ({ url }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={t('common:common.watchGuideTooltip')}>
        <Button icon={<YoutubeOutlined />} onClick={() => setOpen(true)}>
          {t('common:common.watchGuide')}
        </Button>
      </Tooltip>
      <Modal
        title={t('common:common.watchGuide')}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={open ? getEmbedUrl(url) : undefined}
            title={t('common:common.watchGuide')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </Modal>
    </>
  );
};

export default GuideVideoButton;
