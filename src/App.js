import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerify from "./pages/VerifyOtp";
import Home from "./pages/Home";
import Properties from "./pages/dashboard/Properties";
import Property from "./pages/dashboard/Property";
import Leases from "./pages/Leases";
import Lease from "./pages/Lease";
import Tenants from "./pages/Tenants";
import Tenant from "./pages/Tenant";
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';



function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
