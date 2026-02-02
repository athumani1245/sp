import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobile?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setSubscription } = useAuth();

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
