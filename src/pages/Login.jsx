import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/login.css";
import {login} from "../services/authService";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        await login(username, password, navigate, setError);
        setLoading(false);
    };


    return (
        <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
            <div className="mb-4 text-center">
                <div className="text-brand">Smart Pangisha</div>
            </div>
            <div className="login-card p-5 shadow-sm w-100" style={{ maxWidth: "420px" }}>
                <h2 className="mb-3 text-center fw-bold">Log In</h2>
                <p className="text-center text-muted mb-4">Manage your properties anytime, anywhere.</p>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username<span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <label htmlFor="password" className="form-label mb-0">Password<span className="text-danger">*</span></label>
                        <a href="/forgot-password" className="small text-danger btn btn-link p-0" tabIndex={0}>Forgot your password?</a>
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-100 mb-3" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                    {/* <button type="button" className="btn btn-google w-100 mb-3" disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-google" viewBox="4 4 16 16">
                            <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                        </svg>
                        Log in with Google
                    </button> */}
                </form>
                <div className="text-center mt-2">
                    Don't have an account? <a href="/register" className="text-danger">Sign Up</a>
                </div>
            </div>
            <div className="footer mt-4">© 2025 Smart Pangisha</div>
        </div>
    );
}

export default Login;