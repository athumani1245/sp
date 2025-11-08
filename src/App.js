import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/resetPassword";
import OtpVerify from "./pages/VerifyOtp";
import Home from "./pages/Home";
import Properties from "./pages/dashboard/Properties";
import Property from "./pages/dashboard/Property";
import Leases from "./pages/Leases";
import Lease from "./pages/Lease";
import Tenants from "./pages/Tenants";
import Tenant from "./pages/Tenant";
import Reports from "./pages/Reports";
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionModalProvider } from './context/SubscriptionModalContext';

// Report page components
import PropertySummaryReport from './pages/reports/PropertySummaryReport';
import PropertyReport from './pages/reports/PropertyReport';
import LeaseAgreementsReport from './pages/reports/LeaseAgreementsReport';
import TenantReport from './pages/reports/TenantReport';
import TenantPaymentHistoryReport from './pages/reports/TenantPaymentHistoryReport';
import GenericReport from './pages/reports/GenericReport';
import './App.css';



function App() {
  return (
    <AuthProvider>
      <SubscriptionModalProvider>
        <ErrorBoundary>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/otp-verify" element={<OtpVerify />} />

            {/* Protected routes */}
            <Route path="/home" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
          <Route path="/properties" element={
            <PrivateRoute>
              <Properties />
            </PrivateRoute>
          } />
          <Route path="/properties/:propertyId" element={
            <PrivateRoute>
              <Property />
            </PrivateRoute>
          } />
          <Route path="/leases" element={
            <PrivateRoute>
              <Leases />
            </PrivateRoute>
          } />
          <Route path="/leases/:leaseId" element={
            <PrivateRoute>
              <Lease />
            </PrivateRoute>
          } />
          <Route path="/tenants" element={
            <PrivateRoute>
              <Tenants />
            </PrivateRoute>
          } />
          <Route path="/tenants/:tenantId" element={
            <PrivateRoute>
              <Tenant />
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />
          
          {/* Report Routes */}
          <Route path="/reports/property-summary" element={
            <PrivateRoute>
              <PropertySummaryReport />
            </PrivateRoute>
          } />
          <Route path="/reports/lease-agreements" element={
            <PrivateRoute>
              <LeaseAgreementsReport />
            </PrivateRoute>
          } />
          <Route path="/reports/tenant-payment-history" element={
            <PrivateRoute>
              <TenantPaymentHistoryReport />
            </PrivateRoute>
          } />
          <Route path="/reports/lease-expiry" element={
            <PrivateRoute>
              <GenericReport 
                title="Lease Expiry Report" 
                icon="bi-calendar-event" 
                description="This report shows upcoming lease expirations and renewal tracking." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/lease-renewal-termination" element={
            <PrivateRoute>
              <GenericReport 
                title="Lease Renewal/Termination Report" 
                icon="bi-arrow-repeat" 
                description="This report tracks lease renewals, terminations, and contract changes." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/units-availability" element={
            <PrivateRoute>
              <GenericReport 
                title="Units Availability Report" 
                icon="bi-door-open" 
                description="This report shows current availability status of all property units." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/property-performance" element={
            <PrivateRoute>
              <PropertyReport />
            </PrivateRoute>
          } />
          <Route path="/reports/tenant-directory" element={
            <PrivateRoute>
              <GenericReport 
                title="Tenant Directory" 
                icon="bi-people" 
                description="This report provides a complete list of all tenants with contact information." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/tenant-outstanding-balance" element={
            <PrivateRoute>
              <TenantReport />
            </PrivateRoute>
          } />
          <Route path="/reports/payment-summary" element={
            <PrivateRoute>
              <GenericReport 
                title="Payment Summary" 
                icon="bi-cash-stack" 
                description="This report provides a financial overview of payments and outstanding balances." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/occupancy-report" element={
            <PrivateRoute>
              <GenericReport 
                title="Occupancy Report" 
                icon="bi-pie-chart" 
                description="This report shows current occupancy rates and vacancy analysis." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/income-report" element={
            <PrivateRoute>
              <GenericReport 
                title="Income Report" 
                icon="bi-graph-up-arrow" 
                description="This report provides detailed income analysis and revenue tracking." 
              />
            </PrivateRoute>
          } />
          <Route path="/reports/expense-report" element={
            <PrivateRoute>
              <GenericReport 
                title="Expense Report" 
                icon="bi-graph-down-arrow" 
                description="This report tracks expenses and operational costs." 
              />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      </ErrorBoundary>
      </SubscriptionModalProvider>
    </AuthProvider>
  );
}

export default App;
