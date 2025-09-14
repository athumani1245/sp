import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import "../assets/styles/forgot-password.css"; // Reusing forgot password styles
import { resetPassword } from "../services/resetService";

function ResetPassword() {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(5);

    const navigate = useNavigate();
    const location = useLocation();
    
    // Get username and token from navigation state (passed from OTP verification)
    const username = location.state?.username;
    const token = location.state?.token;

    // Redirect if no username or token is provided
    useEffect(() => {
        if (!username || !token) {
            navigate("/forgot-password");
        }
    }, [username, token, navigate]);

    // Countdown timer for redirect
    useEffect(() => {
        let timer;
        if (showSuccessModal && redirectCountdown > 0) {
            timer = setTimeout(() => {
                setRedirectCountdown(redirectCountdown - 1);
            }, 1000);
        } else if (showSuccessModal && redirectCountdown === 0) {
            navigate("/");
        }
        return () => clearTimeout(timer);
    }, [showSuccessModal, redirectCountdown, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(""); // Clear error when user starts typing
    };

    const validateForm = () => {
        if (!formData.newPassword) {
            setError("Please enter a new password");
            return false;
        }
        
        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return false;
        }
        
        if (!formData.confirmPassword) {
            setError("Please confirm your password");
            return false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setError("");
        setLoading(true);

        try {
            const result = await resetPassword(formData.newPassword, token);
            if (result.success) {
                setShowSuccessModal(true);
            } else {
                setError(result.error || "Failed to reset password");
            }
        } catch (err) {
            setError("An error occurred while resetting password");
        } finally {
            setLoading(false);
        }
    };

    const handleRedirectNow = () => {
        navigate("/");
    };

    if (!username || !token) {
        return null; // Will redirect in useEffect
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
                                        Reset Password
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Enter your new password below
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 mb-3">
                                        <small>{error}</small>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label">New Password</label>
                                        <div className="input-group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                id="newPassword"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter new password"
                                                minLength="8"
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex="-1"
                                            >
                                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                            </button>
                                        </div>
                                        <small className="text-muted">Password must be at least 8 characters long</small>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                        <div className="input-group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex="-1"
                                            >
                                                <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        className="btn btn-submit w-100 mb-3" 
                                        disabled={loading}
                                    >
                                        {loading ? "Resetting Password..." : "Reset Password"}
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

            {/* Success Modal */}
            <Modal 
                show={showSuccessModal} 
                backdrop="static" 
                keyboard={false} 
                centered
                className="success-modal"
            >
                <Modal.Body className="text-center p-4">
                    <div className="mb-4">
                        <div className="success-icon mb-3">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                        </div>
                        <h4 className="fw-bold text-success mb-3">Password Reset Successful!</h4>
                        <p className="text-muted mb-4">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                        <div className="countdown-info mb-4">
                            <p className="mb-2">
                                Redirecting to login page in <strong className="text-primary">{redirectCountdown}</strong> seconds
                            </p>
                            <div className="progress" style={{ height: "4px" }}>
                                <div 
                                    className="progress-bar bg-primary"
                                    style={{ 
                                        width: `${((5 - redirectCountdown) / 5) * 100}%`,
                                        transition: "width 1s linear"
                                    }}
                                ></div>
                            </div>
                        </div>
                        <Button 
                            variant="primary" 
                            onClick={handleRedirectNow}
                            className="btn-lg"
                        >
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Go to Login Now
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ResetPassword;
