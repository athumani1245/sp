import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import PermissionRoute from './components/PermissionRoute';
import SubscriptionGate from './components/SubscriptionGate';
import Landing from './pages/Landing';
import PrivacyPolicy from './pages/PrivacyPolicy';
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
import LeaseExpiryReport from './pages/LeaseExpiryReport';
import PendingPaymentsReport from './pages/PendingPaymentsReport';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import PropertyManagers from './pages/PropertyManagers';
import LeaseTemplatesPage from './features/lease-builder/pages/LeaseTemplatesPage';
import TemplateBuilderPage from './features/lease-builder/pages/TemplateBuilderPage';
import LeaseGeneratorPage from './features/lease-builder/pages/LeaseGeneratorPage';
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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Dashboard /></SubscriptionGate>} />
            </Route>
            <Route path="/properties" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<PermissionRoute permission={['can_view_properties', 'can_view_property']}><SubscriptionGate><Properties /></SubscriptionGate></PermissionRoute>} />
              <Route path=":id" element={<PermissionRoute permission={['can_view_properties', 'can_view_property']}><SubscriptionGate><PropertyDetail /></SubscriptionGate></PermissionRoute>} />
            </Route>
            <Route path="/tenants" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Tenants /></SubscriptionGate>} />
              <Route path=":id" element={<SubscriptionGate><TenantDetail /></SubscriptionGate>} />
            </Route>
            <Route path="/leases" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><Leases /></SubscriptionGate>} />
              <Route path=":id" element={<SubscriptionGate><Lease /></SubscriptionGate>} />
            </Route>
            <Route path="/lease-builder" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<SubscriptionGate><LeaseTemplatesPage /></SubscriptionGate>} />
              <Route path="new" element={<SubscriptionGate><TemplateBuilderPage /></SubscriptionGate>} />
              <Route path=":id/edit" element={<SubscriptionGate><TemplateBuilderPage /></SubscriptionGate>} />
              <Route path=":id/generate" element={<SubscriptionGate><LeaseGeneratorPage /></SubscriptionGate>} />
            </Route>
            <Route path="/property-managers" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<PermissionRoute permission="can_view_property_managers"><SubscriptionGate><PropertyManagers /></SubscriptionGate></PermissionRoute>} />
            </Route>
            <Route path="/reports" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route path="lease" element={<PermissionRoute permission="can_view_lease_report"><SubscriptionGate><LeaseReport /></SubscriptionGate></PermissionRoute>} />
              <Route path="lease-expiry" element={<PermissionRoute permission="can_vew_lease_expiry_report"><SubscriptionGate><LeaseExpiryReport /></SubscriptionGate></PermissionRoute>} />
              <Route path="pending-payments" element={<PermissionRoute permission="can_view_pending_payments_report"><SubscriptionGate><PendingPaymentsReport /></SubscriptionGate></PermissionRoute>} />
            </Route>
            <Route path="/profile" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Profile />} />
            </Route>
            <Route path="/subscription" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<PermissionRoute permission="can_subscribe"><Subscription /></PermissionRoute>} />
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
