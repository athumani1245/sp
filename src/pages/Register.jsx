
import React, { useState } from "react";
import "../assets/styles/register.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/registrationService";

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
        <>
            <div className="register-header d-flex justify-content-between align-items-center px-4">
                <div>
                    <span className="text-brand">Smart Pangisha</span>
                </div>
                <div>
                    <span className="me-2">Already have an account?</span>
                    <a href="/" className="nav-link d-inline text-danger">Log In</a>
                </div>
            </div>
            <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
                <div className="register-card w-100">
                    <h2 className="mb-2 text-center fw-bold" style={{ color: "#222" }}>Tell us a bit about yourself</h2>
                    <p className="text-center text-muted mb-4">
                        Please fill in necessary information
                    </p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="first_name" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="first_name" placeholder="Enter your first name" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="last_name" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="last_name" placeholder="Enter your last name" required value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Phone Number</label>
                            <input type="text" className="form-control" id="username" placeholder="e.g. +255 622 330 329" required value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control" id="password" placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                            <input type="password" className="form-control" id="confirm_password" placeholder="Re-enter your password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <span className="step-text"></span>
                            <button type="submit" className="btn btn-register w-100 mb-3" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;