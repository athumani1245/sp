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
  FileProtectOutlined,
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
  const { isSubscriptionExpired, hasPermission } = useAuth();
  const [openKeys, setOpenKeys] = useState<string[]>(['reports']);

  // Helper: build a subscription-gated label/icon/style
  const subExpiredProps = (icon: React.ReactNode, label: string, path: string): MenuItem => ({
    key: path,
    icon: isSubscriptionExpired ? <LockOutlined /> : icon,
    label: isSubscriptionExpired ? (
      <Tooltip title={t('common:nav.subscriptionRequired')}>
        <span>{label}</span>
      </Tooltip>
    ) : label,
    onClick: () => !isSubscriptionExpired && navigate(path),
    disabled: isSubscriptionExpired,
    style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
  });

  // Build report children filtered by permissions
  const reportChildren: MenuItem[] = [
    ...(hasPermission('can_view_lease_report') ? [{
      key: '/reports/lease',
      label: t('common:nav.leaseAgreements'),
      onClick: () => navigate('/reports/lease'),
    } as MenuItem] : []),
    ...(hasPermission('can_vew_lease_expiry_report') ? [{
      key: '/reports/lease-expiry',
      label: t('common:nav.leaseExpiry'),
      onClick: () => navigate('/reports/lease-expiry'),
    } as MenuItem] : []),
    ...(hasPermission('can_view_pending_payments_report') ? [{
      key: '/reports/pending-payments',
      label: t('common:nav.pendingPayments'),
      onClick: () => navigate('/reports/pending-payments'),
    } as MenuItem] : []),
  ];

  const allMenuItems: (MenuItem | null)[] = [
    // Dashboard — always visible
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: t('common:nav.home'),
      onClick: () => navigate('/dashboard'),
    },

    // Properties — requires can_view_properties (owner) or can_view_property (manager)
    hasPermission(['can_view_properties', 'can_view_property'])
      ? subExpiredProps(<BankOutlined />, t('common:nav.properties'), '/properties')
      : null,

    // Tenants — no explicit view permission; always show
    subExpiredProps(<TeamOutlined />, t('common:nav.tenants'), '/tenants'),

    // Leases — no explicit view permission; always show
    subExpiredProps(<FileTextOutlined />, t('common:nav.leases'), '/leases'),

    // Property Managers — requires can_view_property_managers
    hasPermission('can_view_property_managers')
      ? subExpiredProps(<IdcardOutlined />, t('common:nav.propertyManagers'), '/property-managers')
      : null,

    // Subscription — requires can_subscribe
    hasPermission('can_subscribe') ? {
      key: '/subscription',
      icon: <CreditCardOutlined />,
      label: t('common:nav.subscription'),
      onClick: () => navigate('/subscription'),
    } as MenuItem : null,

    // Contract Templates — always visible to authenticated users
    {
      key: '/lease-builder',
      icon: <FileProtectOutlined />,
      label: t('common:nav.contractTemplates'),
      onClick: () => navigate('/lease-builder'),
    },

    // Reports — show group only if user has at least one report permission
    reportChildren.length > 0 ? {
      key: 'reports',
      icon: isSubscriptionExpired ? <LockOutlined /> : <FolderOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title={t('common:nav.subscriptionRequired')}>
          <span>{t('common:nav.reports')}</span>
        </Tooltip>
      ) : t('common:nav.reports'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
      children: isSubscriptionExpired ? undefined : reportChildren,
    } as MenuItem : null,
  ];

  const menuItems: MenuItem[] = allMenuItems.filter(Boolean) as MenuItem[];

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
