import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "../assets/styles/forgot-password.css";
import {sendOtp} from "../services/resetService";
import { usePageTitle } from "../hooks/usePageTitle";

function ForgotPassword() {
    usePageTitle('Forgot Password');
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        await sendOtp(phoneNumber, navigate, setError, setLoading);
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
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
                                <h4 className="mb-1 text-center fw-normal">
                                    Forgot Password?
                                </h4>
                                <small className="text-muted d-block text-center">
                                    Don't worry, we'll send you a verification code to reset it
                                </small>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2 mb-4">
                                    <small>{error}</small>
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success py-2 mb-4">
                                    <small>{success}</small>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
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
                                    <small className="text-muted">We'll send a verification code to this number</small>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-submit w-100" 
                                    disabled={loading}
                                >
                                    {loading ? "Sending OTP..." : "Send Verification Code"}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3 bg-white">
                            <div>
                                <a href="/" className="auth-link">
                                    ← Back to Login
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

export default ForgotPassword;