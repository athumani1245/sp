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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasActiveSubscription, subscription } = useAuth();
  const [openKeys, setOpenKeys] = useState<string[]>(['reports']);

  // Check if subscription is expired
  const isSubscriptionExpired = 
    subscription?.is_active === false || 
    (subscription?.days_left !== undefined && subscription.days_left <= 0) ||
    (!subscription?.is_active && !hasActiveSubscription);

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/properties',
      icon: isSubscriptionExpired ? <LockOutlined /> : <BankOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title="Subscription required">
          <span>Properties</span>
        </Tooltip>
      ) : 'Properties',
      onClick: () => !isSubscriptionExpired && navigate('/properties'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/tenants',
      icon: isSubscriptionExpired ? <LockOutlined /> : <TeamOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title="Subscription required">
          <span>Tenants</span>
        </Tooltip>
      ) : 'Tenants',
      onClick: () => !isSubscriptionExpired && navigate('/tenants'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/leases',
      icon: isSubscriptionExpired ? <LockOutlined /> : <FileTextOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title="Subscription required">
          <span>Leases</span>
        </Tooltip>
      ) : 'Leases',
      onClick: () => !isSubscriptionExpired && navigate('/leases'),
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
    },
    {
      key: '/subscription',
      icon: <CreditCardOutlined />,
      label: 'Subscription',
      onClick: () => navigate('/subscription'),
    },
    {
      key: 'reports',
      icon: isSubscriptionExpired ? <LockOutlined /> : <FolderOutlined />,
      label: isSubscriptionExpired ? (
        <Tooltip title="Subscription required">
          <span>Reports</span>
        </Tooltip>
      ) : 'Reports',
      disabled: isSubscriptionExpired,
      style: isSubscriptionExpired ? { cursor: 'not-allowed', opacity: 0.5 } : {},
      children: isSubscriptionExpired ? undefined : [
        {
          key: '/reports/lease',
          label: 'Lease Agreements',
          onClick: () => navigate('/reports/lease'),
        },
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
