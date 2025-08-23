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
        <>
            <div className="forgot-password-header d-flex justify-content-between align-items-center px-4 mb-0">
                <div>
                    <span className="text-brand">Tanaka</span>
                </div>
                <div>
                    <span className="me-2">Already have an account?</span>
                    <a href="/" className="nav-link d-inline text-danger">Log In</a>
                </div>
            </div>
            <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "30vh" }}>
                <div className="card p-4 shadow mt-4" style={{ maxWidth: 400, width: "100%" }}>
                    <p className="mb-4 text-center">Forgot Password</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <button type="submit" className="btn btn-submit w-100" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;