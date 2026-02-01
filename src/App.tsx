import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import SubscriptionGate from './components/SubscriptionGate';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Tenants from './pages/Tenants';
import TenantDetail from './pages/TenantDetail';
import Leases from './pages/Leases';
import Lease from './pages/Lease';
import LeaseReport from './pages/LeaseReport';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#CC5B4B',
            fontFamily: "'Host Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/properties" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Properties /></SubscriptionGate>} />
              <Route path=":id" element={<SubscriptionGate><PropertyDetail /></SubscriptionGate>} />
            </Route>
            <Route path="/tenants" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Tenants /></SubscriptionGate>} />
              <Route path=":id" element={<SubscriptionGate><TenantDetail /></SubscriptionGate>} />
            </Route>
            <Route path="/leases" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Leases /></SubscriptionGate>} />
              <Route path=":id" element={<SubscriptionGate><Lease /></SubscriptionGate>} />
            </Route>
            <Route path="/reports" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route path="lease" element={<SubscriptionGate><LeaseReport /></SubscriptionGate>} />
            </Route>
            <Route path="/profile" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Profile /></SubscriptionGate>} />
            </Route>
            <Route path="/subscription" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Subscription />} />
            </Route>
            
            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
