import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerify from "./pages/VerifyOtp";
import Home from "./pages/Home";
import Properties from "./pages/dashboard/Properties";
import './App.css';
import { Routes, Route } from 'react-router-dom';



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
      </Routes>
    </div>
  );
}

export default App;
