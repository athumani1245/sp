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
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/home"} element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:propertyId" element={<Property />} />
        <Route path="/leases" element={<Leases />} />
        <Route path="/leases/:leaseId" element={<Lease />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/tenants/:tenantId" element={<Tenant />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </div>
  );
}

export default App;
