import React, { useState } from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  TeamOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  FolderOutlined,
  LockOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, isMobile = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubscriptionExpired } = useAuth();
  const [openKeys, setOpenKeys] = useState<string[]>(['reports']);

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: t('common:nav.home'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/properties',
      icon: isSubscriptionExpired ? <LockOutlined /> : <BankOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title={t('common:nav.subscriptionRequired')}>
          <span>{t('common:nav.properties')}</span>
        </Tooltip>
      ) : t('common:nav.properties'),
      onClick: () => !isSubscriptionExpired && navigate('/properties'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/tenants',
      icon: isSubscriptionExpired ? <LockOutlined /> : <TeamOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title={t('common:nav.subscriptionRequired')}>
          <span>{t('common:nav.tenants')}</span>
        </Tooltip>
      ) : t('common:nav.tenants'),
      onClick: () => !isSubscriptionExpired && navigate('/tenants'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/leases',
      icon: isSubscriptionExpired ? <LockOutlined /> : <FileTextOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title={t('common:nav.subscriptionRequired')}>
          <span>{t('common:nav.leases')}</span>
        </Tooltip>
      ) : t('common:nav.leases'),
      onClick: () => !isSubscriptionExpired && navigate('/leases'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/subscription',
      icon: <CreditCardOutlined />,
      label: t('common:nav.subscription'),
      onClick: () => navigate('/subscription'),
    },
    {
      key: 'reports',
      icon: isSubscriptionExpired ? <LockOutlined /> : <FolderOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title={t('common:nav.subscriptionRequired')}>
          <span>{t('common:nav.reports')}</span>
        </Tooltip>
      ) : t('common:nav.reports'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
      children: isSubscriptionExpired ? undefined : [
        {
          key: '/reports/lease',
          label: t('common:nav.leaseAgreements'),
          onClick: () => navigate('/reports/lease'),
        },
        // {
        //   key: '/reports/lease-expiry',
        //   label: t('common:nav.leaseExpiry'),
        //   onClick: () => navigate('/reports/lease-expiry'),
        // },
      ],
    },
  ];

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Get current selected key based on pathname
  const getSelectedKey = () => {
    return location.pathname;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      className="app-sider"
      width={250}
      collapsedWidth={isMobile ? 0 : 80}
      style={isMobile ? { position: 'relative' } : {}}
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={menuItems}
        className="sidebar-menu"
      />
    </Sider>
  );
};

export default AppSidebar;
