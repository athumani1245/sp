import React, { useMemo } from 'react';
import { Layout, Button, Dropdown, Avatar, Space, message, Badge, List, Typography, Tag, Empty, Popover } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
  BellOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import { useReminders } from '../../hooks/useNotes';
import type { Note } from '../../services/noteService';
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
  const { setIsAuthenticated, setSubscription } = useAuth();
  const { data: reminders } = useReminders();

  const reminderList: Note[] = useMemo(() => {
    const list: Note[] = Array.isArray(reminders) ? reminders : [];
    return [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [reminders]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = reminderList.filter((r) => {
    const d = new Date(r.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  }).length;

  const getDueBadgeColor = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'red';
    if (diffDays === 0) return 'orange';
    if (diffDays <= 3) return 'gold';
    return 'blue';
  };

  const getDueLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays}d`;
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
          Reminders
        </Text>
        {overdueCount > 0 && (
          <Tag color="red" icon={<WarningOutlined />}>
            {overdueCount} overdue
          </Tag>
        )}
      </div>
      {reminderList.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No reminders"
          style={{ padding: '24px 0' }}
        />
      ) : (
        <List
          dataSource={reminderList}
          renderItem={(item) => (
            <List.Item
              style={{ padding: '10px 12px', cursor: 'default' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={32}
                    style={{
                      backgroundColor: getDueBadgeColor(item.date) === 'red' ? '#ff4d4f' : '#CC5B4B',
                    }}
                    icon={<ClockCircleOutlined />}
                  />
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      strong
                      ellipsis
                      style={{ maxWidth: 200, fontSize: 13 }}
                    >
                      {item.title}
                    </Text>
                    <Tag
                      color={getDueBadgeColor(item.date)}
                      style={{ marginLeft: 8, flexShrink: 0, fontSize: 11 }}
                    >
                      {getDueLabel(item.date)}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text
                      type="secondary"
                      ellipsis
                      style={{ fontSize: 12, display: 'block' }}
                    >
                      {item.content}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.date}
                      {item.model && (
                        <Tag
                          style={{ marginLeft: 8, fontSize: 10 }}
                          bordered={false}
                        >
                          {item.model}
                        </Tag>
                      )}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const handleLogout = async () => {
    try {
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
          >
            <Badge count={reminderList.length} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                className="notification-btn"
                title="Reminders"
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
