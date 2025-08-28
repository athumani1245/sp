
import React, { useState } from "react";
import "../assets/styles/register.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/registrationService";

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const data = {
            'first_name': firstName,
            'last_name': lastName,
            'email': email,
            'username': username,
            'password': password,
        }
        const result = await registerUser(data);
        if (result.success) {
            setSuccess("Registration successful! Login to continue.");
            setTimeout(() => navigate("/"), 2000);
        } else {
            setError(result.error);
        }
        setLoading(false);
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
            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                            <div className="register-card">
                                <div className="text-center mb-4">
                                    <img 
                                        src="/Logo.png" 
                                        alt="Tanaka Logo" 
                                        className="mb-3"
                                        style={{ width: "64px", height: "64px" }}
                                    />
                                    <h2 className="mb-2 fw-normal text-center">
                                        Tell us a bit about yourself
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Please fill in necessary information
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
                                        <div className="col-md-6">
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
                                            <label htmlFor="username" className="form-label">Phone Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0">
                                                    <span className="me-2">🇹🇿</span>
                                                    <span className="text-muted">+255</span>
                                                </span>
                                                <input 
                                                    type="text" 
                                                    className="form-control border-start-0" 
                                                    id="username" 
                                                    placeholder="622 330 329" 
                                                    required 
                                                    value={username} 
                                                    onChange={e => setUsername(e.target.value)} 
                                                />
                                            </div>
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
                                                className="btn btn-register w-100 mt-2" 
                                                disabled={loading}
                                            >
                                                {loading ? "Registering..." : "Create Account"}
                                            </button>
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
                    &copy; {new Date().getFullYear()} SmartHaven Tanzania. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Register;