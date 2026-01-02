
import React, { useState, useRef, useEffect } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "../assets/styles/register.css";
import { useNavigate } from "react-router-dom";
import { registerUser, sendRegistrationOtp, verifyRegistrationOtp } from "../services/registrationService";
import { Modal } from 'react-bootstrap';

function Register() {
    // Registration stages: 'phone' -> 'otp' -> 'form' -> 'success'
    const [stage, setStage] = useState('phone');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    
    // Form data
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // OTP states
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    // General states
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();

    // Countdown timer effect for OTP resend
    useEffect(() => {
        let interval = null;
        if (countdown > 0 && !canResend && showOtpModal) {
            interval = setInterval(() => {
                setCountdown(countdown => countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [countdown, canResend, showOtpModal]);

    // Auto-focus first OTP input when modal opens
    useEffect(() => {
        if (showOtpModal && inputRefs[0].current) {
            setTimeout(() => {
                inputRefs[0].current.focus();
            }, 100);
        }
    }, [showOtpModal]);

    const handleOtpChange = (e, idx) => {
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

    const handleResendOtp = async () => {
        if (!canResend || resendLoading) return;
        
        setResendLoading(true);
        setOtpError("");
        
        try {
            const result = await sendRegistrationOtp(phoneNumber);
            if (result.success) {
                setCountdown(60);
                setCanResend(false);
                setOtpError("");
                setOtp(["", "", "", ""]);
            } else {
                setOtpError(result.error || "Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setOtpError("Failed to resend OTP. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!phoneNumber || phoneNumber.length < 10) {
            setError("Please enter a valid phone number.");
            return;
        }

        setLoading(true);
        
        try {
            // Step 1: Send OTP to user's phone
            const otpResult = await sendRegistrationOtp(phoneNumber);
            
            if (otpResult.success) {
                // Show OTP modal and move to OTP stage
                setStage('otp');
                setShowOtpModal(true);
                setCountdown(60);
                setCanResend(false);
                setError("");
            } else {
                setError(otpResult.error || "Failed to send verification code. Please try again.");
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError("Failed to send verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        
        try {
            // Complete registration after OTP verification
            const data = {
                'first_name': firstName,
                'last_name': lastName,
                'email': email,
                'username': phoneNumber,
                'password': password,
            };
            
            const registerResult = await registerUser(data);
            
            if (registerResult.statusCode === 200 || registerResult.success) {
                // Move to success stage
                setStage('success');
                
                // Redirect to login after showing success
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 3000);
            } else {
                setError(registerResult.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error('Error registering:', error);
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setOtpError("");
        
        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            setOtpError("Please enter all 4 digits");
            return;
        }
        
        setLoading(true);
        
        try {
            // Step 2: Verify OTP
            const verifyResult = await verifyRegistrationOtp(phoneNumber, otpCode);
            
            if (verifyResult.success) {
                // OTP verified successfully - move to registration form
                setIsOtpVerified(true);
                setStage('form');
                setShowOtpModal(false);
                setOtpError("");
            } else {
                setOtpError(verifyResult.error || "Invalid verification code. Please try again.");
                // Clear OTP inputs on error
                setOtp(["", "", "", ""]);
                if (inputRefs[0].current) {
                    inputRefs[0].current.focus();
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setOtpError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseOtpModal = () => {
        setShowOtpModal(false);
        setOtp(["", "", "", ""]);
        setOtpError("");
        setStage('phone');
    };
    
    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Header */}
            <header className="register-header">
                <div className="container">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-auto">
                            <span className="text-brand">Tanaka</span>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex align-items-center">
                                <span className="me-2 d-none d-md-inline">Already have an account?</span>
                                <a href="/" className="nav-link text-danger fw-medium">
                                    Log In
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="container my-4">
                    <div className="card mx-auto shadow-sm" style={{ maxWidth: "520px" }}>
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <img 
                                    src="/Logo.png" 
                                    alt="Tanaka Logo" 
                                    className="mb-3"
                                    style={{ width: "64px", height: "64px" }}
                                />
                                
                                {/* Stage Indicator */}
                                {stage !== 'success' && (
                                    <div className="registration-stages mb-4">
                                        <div className={`stage-item ${stage === 'phone' ? 'active' : (stage === 'otp' || stage === 'form' || stage === 'success') ? 'completed' : ''}`}>
                                            <div className="stage-circle">
                                                {(stage === 'otp' || stage === 'form' || stage === 'success') ? (
                                                    <i className="bi bi-check"></i>
                                                ) : (
                                                    <span>1</span>
                                                )}
                                            </div>
                                            <span className="stage-label">Phone Number</span>
                                        </div>
                                        <div className="stage-line"></div>
                                        <div className={`stage-item ${stage === 'otp' ? 'active' : (stage === 'form' || stage === 'success') ? 'completed' : ''}`}>
                                            <div className="stage-circle">
                                                {(stage === 'form' || stage === 'success') ? (
                                                    <i className="bi bi-check"></i>
                                                ) : (
                                                    <span>2</span>
                                                )}
                                            </div>
                                            <span className="stage-label">Verify OTP</span>
                                        </div>
                                        <div className="stage-line"></div>
                                        <div className={`stage-item ${stage === 'form' ? 'active' : stage === 'success' ? 'completed' : ''}`}>
                                            <div className="stage-circle">
                                                {stage === 'success' ? (
                                                    <i className="bi bi-check"></i>
                                                ) : (
                                                    <span>3</span>
                                                )}
                                            </div>
                                            <span className="stage-label">Complete Info</span>
                                        </div>
                                    </div>
                                )}
                                
                                <h4 className="mb-1 text-center fw-normal">
                                    {stage === 'phone' && 'Enter Your Phone Number'}
                                    {stage === 'otp' && 'Verify Your Phone Number'}
                                    {stage === 'form' && 'Complete Your Registration'}
                                    {stage === 'success' && 'Registration Successful!'}
                                </h4>
                                <small className="text-muted d-block text-center">
                                    {stage === 'phone' && 'We\'ll send you a verification code'}
                                    {stage === 'otp' && 'Enter the code sent to your phone'}
                                    {stage === 'form' && 'Fill in your details to complete registration'}
                                    {stage === 'success' && 'Your account has been created successfully'}
                                </small>
                            </div>

                            {error && (stage === 'phone' || stage === 'form') && (
                                <div className="alert alert-danger py-2 mb-4">
                                    <small>{error}</small>
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success py-2 mb-4">
                                    <small>{success}</small>
                                </div>
                            )}
                            
                            {/* Success Stage */}
                            {stage === 'success' && (
                                <div className="text-center py-4">
                                    <div className="success-checkmark mb-4">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h5 className="mb-3">Welcome to Tanaka!</h5>
                                    <p className="text-muted mb-4">
                                        Your account has been successfully created.<br/>
                                        Redirecting you to login...
                                    </p>
                                    <div className="spinner-border text-danger" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Phone Number Entry Form */}
                            {stage === 'phone' && (
                            <form onSubmit={handlePhoneSubmit}>
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
                                    className="odoo-btn odoo-btn-primary w-100 mt-3" 
                                    disabled={loading || !phoneNumber}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Sending Code...
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </>
                                    )}
                                </button>
                            </form>
                            )}
                            
                            {/* Registration Form */}
                            {stage === 'form' && (
                            <form onSubmit={handleRegistrationSubmit}>
                                {/* Show verified phone number */}
                                <div className="alert alert-success py-2 mb-3 d-flex align-items-center">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <small>Phone number verified: <strong>{phoneNumber}</strong></small>
                                </div>
                                
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label htmlFor="first_name" className="form-label">First Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="first_name" 
                                            placeholder="Enter your first name" 
                                            required 
                                            value={firstName} 
                                            onChange={e => setFirstName(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="last_name" className="form-label">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="last_name" 
                                            placeholder="Enter your last name" 
                                            required 
                                            value={lastName} 
                                            onChange={e => setLastName(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="Enter your email" 
                                            required 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            placeholder="Enter your password" 
                                            required 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="confirm_password" 
                                            placeholder="Re-enter your password" 
                                            required 
                                            value={confirmPassword} 
                                            onChange={e => setConfirmPassword(e.target.value)} 
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button 
                                            type="submit" 
                                            className="odoo-btn odoo-btn-primary w-100 mt-2" 
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    Create Account
                                                    <i className="bi bi-check-circle ms-2"></i>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            )}
                        </div>
                        {stage !== 'success' && (
                        <div className="card-footer text-center py-3 bg-white">
                            <div>
                                Already have an account? 
                                <a href="/" className="auth-link ms-1">
                                    Log In
                                </a>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <Modal 
                show={showOtpModal} 
                onHide={handleCloseOtpModal} 
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>
                        <i className="bi bi-shield-check me-2 text-danger"></i>
                        Verify Your Phone
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <p className="text-muted mb-0">
                            We've sent a verification code to
                        </p>
                        <p className="fw-bold mb-0">{phoneNumber}</p>
                        <small className="text-muted">Enter the 4-digit code below</small>
                    </div>

                    {otpError && (
                        <div className="alert alert-danger py-2 mb-3">
                            <small><i className="bi bi-exclamation-circle me-1"></i>{otpError}</small>
                        </div>
                    )}

                    <form onSubmit={handleOtpVerify}>
                        <div className="mb-4">
                            <div className="otp-input-container d-flex justify-content-center gap-2 mb-3">
                                {[0, 1, 2, 3].map((idx) => (
                                    <input
                                        key={idx}
                                        ref={inputRefs[idx]}
                                        type="text"
                                        className="otp-input form-control text-center"
                                        maxLength={1}
                                        value={otp[idx]}
                                        onChange={e => handleOtpChange(e, idx)}
                                        inputMode="numeric"
                                        disabled={loading}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="odoo-btn odoo-btn-primary w-100 mb-3" 
                            disabled={loading || otp.some(digit => digit === "")}
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            )}
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>

                        <div className="text-center">
                            {!canResend ? (
                                <p className="countdown-text mb-0">
                                    Resend code in <span className="countdown-number">{countdown}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-danger text-decoration-none"
                                    onClick={handleResendOtp}
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                            Resend Code
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Footer */}
            <footer className="py-4 text-center">
                <div className="text-muted small">
                    &copy; {new Date().getFullYear()} Tanaka. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Register;