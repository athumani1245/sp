import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {logout} from "../../services/authService";

function Header() {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout(navigate);
    }

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }

    }, [navigate]);

    return (
        <div className="dashboard-header">
            <div>
                {/* <img src="https://svgshare.com/i/14hA.svg" alt="Magnolia Logo" className="brand-logo" /> */}
                <a href="/dashboard" className="text-brand text-decoration-none">
                    Tanaka
                </a>
            </div>
            <input type="text" className="search-box" placeholder="Search" />
            <div className="d-flex align-items-center">
                <button className="icon-btn"><i className="bi bi-bell"></i></button>
                {/* Added link to profile page */}
                <a href="/profile" className="profile-circle dropdown-toggle" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false" type="button" style={{ textDecoration: 'none', color: 'inherit' }}>
                    O
                </a>
                <ul className="dropdown-menu dropdown-menu-end mt-2" aria-labelledby="profileDropdown">
                    <li>
                        <button className="dropdown-item" type="button" onClick={() => navigate('/profile')}>
                            Profile
                        </button>
                    </li>
                    <li><button className="dropdown-item" type="button">Settings</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>
        </div>
    );
}
export default Header;