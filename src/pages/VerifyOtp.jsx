import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { verifyOtp, sendOtp } from "../services/resetService";
import { useNavigate } from "react-router-dom";
import "../assets/styles/verify-otp.css";

function OtpVerify() {
    // Get phone number (or username) from previous page via location.state
    const location = useLocation();
    const { username } = location.state || {};

    const [otp, setOtp] = useState(["", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();

    // Countdown timer effect
    useEffect(() => {
        let interval = null;
        if (countdown > 0 && !canResend) {
            interval = setInterval(() => {
                setCountdown(countdown => countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [countdown, canResend]);

    const handleChange = (e, idx) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);
        if (value && idx < 3) {
            inputRefs[idx + 1].current.focus();
        }
        if (!value && idx > 0 && e.nativeEvent.inputType === "deleteContentBackward") {
            inputRefs[idx - 1].current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOtpError("");
        setOtpLoading(true);

        await verifyOtp(username, otp.join(""), setOtpError, navigate);
        setOtpLoading(false);
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        
        setResendLoading(true);
        setOtpError("");
        
        try {
            await sendOtp(username, navigate, setOtpError, setResendLoading);
            // Reset timer
            setCountdown(60);
            setCanResend(false);
            // Clear OTP inputs
            setOtp(["", "", "", ""]);
            inputRefs[0].current.focus();
        } catch (error) {
            console.error('Resend OTP error:', error);
        }
        
        setResendLoading(false);
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Header */}
            <header className="verify-otp-header">
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
                            <div className="verify-otp-card">
                                <div className="text-center mb-4">
                                    <img 
                                        src="/Logo.png" 
                                        alt="Tanaka Logo" 
                                        className="mb-3"
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                    <h2 className="mb-2 fw-normal text-center">
                                        Verify your Phone Number
                                    </h2>
                                    <p className="text-muted mb-0">
                                        We've sent a verification code to your phone number ending in ***{username?.slice(-3) || '***'}
                                    </p>
                                </div>

                                {otpError && (
                                    <div className="alert alert-danger py-2 mb-3">
                                        <small>{otpError}</small>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} autoComplete="off">
                                    <div className="mb-4">
                                        <label className="form-label text-center d-block mb-3">Enter Verification Code</label>
                                        <div className="otp-input-container d-flex justify-content-center gap-2 mb-3">
                                            {[0, 1, 2, 3].map((idx) => (
                                                <input
                                                    key={idx}
                                                    ref={inputRefs[idx]}
                                                    type="text"
                                                    className="otp-input form-control text-center"
                                                    maxLength={1}
                                                    value={otp[idx]}
                                                    onChange={e => handleChange(e, idx)}
                                                    inputMode="numeric"
                                                    disabled={otpLoading}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-verify w-100 mb-3" 
                                        disabled={otpLoading || otp.some(digit => digit === "")}
                                    >
                                        {otpLoading && (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        )}
                                        {otpLoading ? "Verifying..." : "Verify Code"}
                                    </button>
                                    
                                    <div className="text-center">
                                        {!canResend ? (
                                            <p className="countdown-text">
                                                You can resend the code in <span className="countdown-number">{countdown}</span> seconds
                                            </p>
                                        ) : (
                                            <p className="text-muted mb-2">
                                                Didn't receive the code?
                                            </p>
                                        )}
                                        
                                        <button
                                            type="button"
                                            className={`btn btn-link p-0 text-decoration-none ${canResend ? 'text-danger' : 'text-muted'}`}
                                            onClick={handleResendOtp}
                                            disabled={!canResend || resendLoading}
                                        >
                                            {resendLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                'Resend Code'
                                            )}
                                        </button>
                                        
                                        <div className="mt-3">
                                            <a href="/forgot-password" className="text-muted text-decoration-none small">
                                                ← Change Phone Number
                                            </a>
                                        </div>
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

export default OtpVerify;
