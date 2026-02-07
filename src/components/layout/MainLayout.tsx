import React, { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import '../../assets/styles/layout.css';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    // Close mobile drawer on navigation
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  }, [location.pathname, isMobile]);

  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader
        collapsed={collapsed}
        setCollapsed={isMobile ? toggleMobileDrawer : setCollapsed}
        isMobile={isMobile}
      />
      <Layout>
        {isMobile ? (
          <Drawer
            placement="left"
            onClose={() => setMobileDrawerVisible(false)}
            open={mobileDrawerVisible}
            styles={{ body: { padding: 0 } }}
            size={250}
          >
            <AppSidebar collapsed={false} isMobile={true} />
          </Drawer>
        ) : (
          <AppSidebar collapsed={collapsed} isMobile={false} />
        )}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
            transition: 'margin-left 0.2s',
          }}
        >
          <Content className="main-content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
