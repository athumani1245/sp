import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "../assets/styles/login.css";
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
function Login() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Redirect if user is already logged in
    const { isAuthenticated } = useAuth();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginService(phoneNumber, password);
            if (result.success) {
                // Update auth context
                login(result.token, result.user);
                
                // Always navigate to dashboard
                navigate("/dashboard", { replace: true });
            } else {
                setError(result.error || "Login failed");
            }
        } catch (error) {
            setError(error.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-vh-100 d-flex flex-column">
            <header className="login-header">
                <div className="container">
                    <div className="text-brand">Tanaka</div>
                </div>
            </header>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="container my-4">
                    <div className="card mx-auto shadow-sm" style={{ maxWidth: "420px" }}>
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <img 
                                    src="/Logo.png" 
                                    alt="Tanaka Logo" 
                                    className="mb-3"
                                    style={{ width: "64px", height: "64px" }}
                                />
                                <h4 className="mb-1 text-center fw-normal" style={{ textAlign: "center !important" }}>Rent & Manage with Ease</h4>
                                <small className="text-muted d-block text-center">Please log in to your account</small>
                            </div>
                            {error && (
                                <div className="alert alert-danger py-2 mb-4">
                                    <small>{error}</small>
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <div className="phone-input-wrapper">
                                        <PhoneInput
                                            international
                                            countryCallingCodeEditable={false}
                                            defaultCountry="TZ"
                                            value={phoneNumber}
                                            onChange={setPhoneNumber}
                                            className="phone-input-custom"
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-key"></i>
                                        </span>

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <span 
                                            className="input-group-text" 
                                            role="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                            tabIndex="0"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setShowPassword(!showPassword);
                                                }
                                            }}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="odoo-btn odoo-btn-primary w-100" 
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Log in"}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3 bg-white">
                            <div className="mb-2">
                                Don't have an account? 
                                <a href="/register" className="auth-link ms-1">
                                    Sign up
                                </a>
                            </div>
                            <div>
                                <a href="/forgot-password" className="auth-link">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="mt-2">
                                <a href="/privacy-policy" className="auth-link">
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="py-4 text-center">
                <div className="text-muted small">
                    &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Login;