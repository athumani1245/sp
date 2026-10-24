import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const items: MenuProps['items'] = [
    {
      key: 'en',
      label: t('common:language.en'),
      onClick: () => changeLanguage('en'),
    },
    {
      key: 'sw',
      label: t('common:language.sw'),
      onClick: () => changeLanguage('sw'),
    },
  ];

  const currentLanguageLabel = i18n.language === 'en' ? t('common:language.en') : t('common:language.sw');

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button type="text" icon={<GlobalOutlined />}>
        <Space>
          {currentLanguageLabel}
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
