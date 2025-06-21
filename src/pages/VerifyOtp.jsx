import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { verifyOtp } from "../services/resetService";
import { useNavigate } from "react-router-dom";

function OtpVerify() {
    // Get phone number (or username) from previous page via location.state
    const location = useLocation();
    const { username } = location.state || {};

    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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

    // phone is now available as a variable in this page
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setOtpError("");
        setOtpLoading(true);

        await verifyOtp(username, otp.join(""), setOtpError, navigate);
        setOtpLoading(false);


    };

    return (
        <>
            <div className="forgot-password-header d-flex justify-content-between align-items-center px-4">
                <div>
                    <span className="text-brand">Smart Pangisha</span>
                </div>
                <div>
                    <span className="me-2">Already have an account?</span>
                    <a href="/login" className="nav-link d-inline text-danger">Log In</a>
                </div>
            </div>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f6f9fc" }}>
                <div className="p-4" style={{ background: "#fff", border: "1px solid #e3e8ee", borderRadius: 0, maxWidth: 370, width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                    <h3 className="fw-bold text-center mb-2" style={{ fontSize: 24 }}>Verify your Phone Number</h3>
                    <div className="text-center text-muted mb-4" style={{ fontSize: 15 }}>
                        Please check your phone for a message containing&nbsp;
                        <span className="fw-semibold">OTP Code</span>. And Enter the code &nbsp; below.
                    </div>
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                            {[0, 1, 2, 3].map((idx) => (
                                <input
                                    key={idx}
                                    ref={inputRefs[idx]}
                                    type="text"
                                    className="form-control text-center"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        fontSize: 24,
                                        borderRadius: 6,
                                        outline: "none",
                                        boxShadow: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    maxLength={1}
                                    value={otp[idx]}
                                    onChange={e => handleChange(e, idx)}
                                    inputMode="numeric"
                                    disabled={otpLoading}
                                />
                            ))}
                        </div>
                        {otpError && (
                            <div className="alert alert-danger py-2 text-center" style={{ fontSize: 15 }} role="alert">
                                {otpError}
                            </div>
                        )}

                        <div className="text-center mb-2" style={{ fontSize: 15 }}>
                            You can resend the code in <span style={{ color: '#000', fontWeight: 500 }}>60</span> seconds.
                        </div>
                        <div className="text-center mb-3">
                        <span className="fw-semibold" style={{ color: '#000', textDecoration: 'underline', fontSize: 16, cursor: 'pointer' }}>
                            Resend code
                        </span>
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                style={{ fontSize: 18, padding: '10px 0', background: '#000' }}
                                disabled={otpLoading || otp.some(digit => digit === "")}
                            >
                                {otpLoading && (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                )}
                                {otpLoading ? "Verifying..." : "Submit OTP"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default OtpVerify;
