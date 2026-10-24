import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, message, Badge, List, Typography, Empty, Popover, Skeleton, Tabs } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
  BellOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import { useNotifications } from '../../hooks/useNotifications';
import { unregisterFromPush, notificationLink } from '../../services/notificationService';
import type { AppNotification } from '../../services/notificationService';
import LanguageSwitcher from '../LanguageSwitcher';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobile?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, setIsAuthenticated, setSubscription } = useAuth();
  const {
    notifications,
    isLoading: notificationsLoading,
    unreadCount,
    isUnread,
    markAllSeen,
    remove: removeNotification,
    enablePush,
    permission,
  } = useNotifications(isAuthenticated);
  const [notificationTab, setNotificationTab] = React.useState('all');

  // One tab per type that actually has notifications; untyped ones only show under "All".
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.entityType).filter((type): type is string => Boolean(type)))
  );
  const activeNotificationTab = notificationTypes.includes(notificationTab) ? notificationTab : 'all';
  const visibleNotifications =
    activeNotificationTab === 'all'
      ? notifications
      : notifications.filter((n) => n.entityType === activeNotificationTab);

  const formatRelativeTime = (date: Date | null): string => {
    if (!date) return '';
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return t('notifications:notifications.justNow');
    if (minutes < 60) return t('notifications:notifications.minutesAgo', { count: minutes });
    const hours = Math.round(minutes / 60);
    if (hours < 24) return t('notifications:notifications.hoursAgo', { count: hours });
    const days = Math.round(hours / 24);
    if (days < 30) return t('notifications:notifications.daysAgo', { count: days });
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: AppNotification) => {
    navigate(notificationLink(notification));
  };

  const handleEnablePush = async () => {
    const granted = await enablePush();
    message[granted ? 'success' : 'info'](
      t(granted ? 'notifications:notifications.pushEnabled' : 'notifications:notifications.pushDenied')
    );
  };

  const notificationContent = (
    <div style={{ width: 360, maxHeight: 420, overflow: 'auto' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong style={{ fontSize: 15 }}>
          <BellOutlined style={{ marginRight: 6 }} />
          {t('notifications:notifications.title')}
        </Text>
        {permission === 'default' && (
          <Button type="link" size="small" onClick={handleEnablePush} style={{ padding: 0 }}>
            {t('notifications:notifications.enablePush')}
          </Button>
        )}
      </div>
      {notificationsLoading ? (
        <div style={{ padding: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('notifications:notifications.empty')}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <>
        <Tabs
          size="small"
          activeKey={activeNotificationTab}
          onChange={setNotificationTab}
          tabBarStyle={{ margin: 0, padding: '0 12px' }}
          items={['all', ...notificationTypes].map((type) => ({
            key: type,
            label: `${t(`notifications:notifications.types.${type}`, { defaultValue: type })} (${
              type === 'all' ? notifications.length : notifications.filter((n) => n.entityType === type).length
            })`,
          }))}
        />
        <List
          dataSource={visibleNotifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                backgroundColor: isUnread(item) ? 'rgba(204, 91, 75, 0.06)' : undefined,
              }}
              actions={[
                <Button
                  key="delete"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  title={t('notifications:notifications.delete')}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(item.id);
                  }}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={isUnread(item)} offset={[-2, 4]}>
                    <Avatar size={32} style={{ backgroundColor: '#CC5B4B' }} icon={<BellOutlined />} />
                  </Badge>
                }
                title={
                  <Text style={{ fontSize: 13, whiteSpace: 'normal' }} strong={isUnread(item)}>
                    {item.title ? `${item.title}: ${item.description}` : item.description}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
        </>
      )}
    </div>
  );

  const handleLogout = async () => {
    try {
      // Detach this browser first, so the next user here does not inherit pushes.
      await unregisterFromPush();
      await logout();
      setIsAuthenticated(false);
      setSubscription(null);
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      message.error('Logout failed');
      // Still navigate to login even if API call fails
      navigate('/login');
    }
  };

  const handleRestartTour = () => {
    // Get current page tour key
    const pathToTourKey: { [key: string]: string } = {
      '/dashboard': 'dashboard',
      '/properties': 'properties',
      '/tenants': 'tenants',
      '/leases': 'leases',
    };

    const tourKey = pathToTourKey[location.pathname];
    
    if (tourKey) {
      // Reset the specific tour
      const STORAGE_KEY = 'tanaka_tours_completed';
      const stored = localStorage.getItem(STORAGE_KEY);
      const completedTours = stored ? JSON.parse(stored) : {};
      delete completedTours[tourKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTours));
      
      message.success('Tour restarted! Refresh the page to see it.');
      // Refresh the page to trigger the tour
      window.location.reload();
    } else {
      message.info('No tour available for this page. Visit Dashboard, Properties, Tenants, or Leases to see tours.');
    }
  };

  const handleResetAllTours = () => {
    localStorage.removeItem('tanaka_tours_completed');
    message.success('All tours have been reset!');
  };

  const helpMenuItems: MenuProps['items'] = [
    {
      key: 'restart-tour',
      label: 'Restart Page Tour',
      icon: <CompassOutlined />,
      onClick: handleRestartTour,
    },
    {
      key: 'reset-all-tours',
      label: 'Reset All Tours',
      icon: <QuestionCircleOutlined />,
      onClick: handleResetAllTours,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'contract-templates',
      label: 'Contract Templates',
      icon: <FileTextOutlined />,
      onClick: () => navigate('/lease-builder'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="trigger-btn"
        />
        <span className="brand-name-header">Tanaka</span>
      </div>

      <div className="header-right">
        <Space size="middle">
          <LanguageSwitcher />
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            overlayInnerStyle={{ padding: 0 }}
            onOpenChange={(open) => {
              // Mark on close so unread highlighting survives while the tray is read.
              if (!open) markAllSeen();
            }}
          >
            <Badge
              count={unreadCount}
              size="small"
              offset={[-2, 2]}
              overflowCount={99}
              className={unreadCount > 0 ? 'notification-badge-active' : ''}
            >
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                className={`notification-btn${unreadCount > 0 ? ' notification-btn-active' : ''}`}
                title={t('notifications:notifications.title')}
              />
            </Badge>
          </Popover>
          <Dropdown menu={{ items: helpMenuItems }} placement="bottomRight" trigger={['click']}>
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="help-btn"
              title="Help & Tours"
            />
          </Dropdown>
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <Avatar
              size="large"
              style={{ backgroundColor: '#CC5B4B', cursor: 'pointer' }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;
