import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/forgot-password.css";
import {sendOtp} from "../services/resetService";

function ForgotPassword() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        await sendOtp(username, navigate, setError, setLoading);
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Header */}
            <header className="forgot-password-header">
                <div className="container">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-auto">
                            <span className="text-brand">Tanaka</span>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex align-items-center">
                                <span className="me-2 d-none d-md-inline">Remember your password?</span>
                                <a href="/" className="nav-link text-danger fw-medium">
                                    Log In
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-10 col-md-6 col-lg-5 col-xl-4">
                            <div className="forgot-password-card">
                                <div className="text-center mb-4">
                                    <img 
                                        src="/Logo.png" 
                                        alt="Tanaka Logo" 
                                        className="mb-3"
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                    <h2 className="mb-2 fw-normal text-center">
                                        Forgot Password?
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Don't worry, we'll send you a verification code to reset it
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 mb-3">
                                        <small>{error}</small>
                                    </div>
                                )}
                                {success && (
                                    <div className="alert alert-success py-2 mb-3">
                                        <small>{success}</small>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="username" className="form-label">Phone Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
                                                <span className="me-2">🇹🇿</span>
                                                <span className="text-muted">+255</span>
                                            </span>
                                            <input
                                                type="tel"
                                                className="form-control border-start-0"
                                                id="username"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                required
                                                placeholder="622 330 329"
                                            />
                                        </div>
                                        <small className="text-muted">We'll send a verification code to this number</small>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-submit w-100 mb-3" 
                                        disabled={loading}
                                    >
                                        {loading ? "Sending OTP..." : "Send Verification Code"}
                                    </button>
                                    
                                    <div className="text-center">
                                        <a href="/" className="text-muted text-decoration-none small">
                                            ← Back to Login
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center">
                <div className="text-muted small">
                    &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default ForgotPassword;