import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";
import { logout } from "../../services/authService";
import { useSubscriptionModal } from "../../context/SubscriptionModalContext";
import SubscriptionModal from "../forms/SubscriptionModal";
import TourHelpButton from "../TourHelpButton";
import "../../assets/styles/header.css";

function Header() {
    const navigate = useNavigate();
    const { registerModalOpener } = useSubscriptionModal();
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);

    const handleLogout = async () => {
        await logout(navigate);
    }

    const handleUpgradePlan = useCallback(() => {
        setShowSubscribeModal(true);
    }, []);

    // Register the modal opener with context
    useEffect(() => {
        registerModalOpener(handleUpgradePlan);
    }, [handleUpgradePlan, registerModalOpener]);

    const handleSubscriptionSuccess = async () => {
        // Subscription successful
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }
    }, []);

    const handleMobileNavToggle = () => {
        setShowMobileNav(!showMobileNav);
        document.body.style.overflow = !showMobileNav ? 'hidden' : '';
    };

    return (
        <>
            {/* Main Header */}
            <header className="fixed-top bg-white border-bottom">
                <nav className="navbar navbar-expand-lg py-2">
                    <div className="container-fluid px-3">
                        {/* Mobile Menu Toggle */}
                        <button 
                            className="btn d-lg-none p-0" 
                            onClick={handleMobileNavToggle}
                            aria-label="Toggle navigation"
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>

                        {/* Brand - Left on desktop, centered on mobile */}
                        <a className="navbar-brand mx-lg-0 position-absolute start-50 translate-middle-x d-lg-relative" 
                           href="/dashboard">
                            Tanaka
                        </a>

                        {/* Right Section - Always right aligned */}
                        <div className="ms-auto d-flex align-items-center gap-2">
                            {/* Tour Help Button - Hidden on mobile */}
                            <div className="d-none d-lg-block">
                                <TourHelpButton />
                            </div>
                            
                            
                            {/* Profile Dropdown */}
                            <div className="dropdown">
                                <button 
                                    className="btn p-0 border-0" 
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center text-white" 
                                         style={{ width: '35px', height: '35px' }}>
                                        <span>O</span>
                                    </div>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm mt-2">
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                            <i className="bi bi-person me-2"></i>Profile
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right me-2"></i>Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Navigation Overlay */}
            <div 
                className={`mobile-nav-overlay ${showMobileNav ? 'show' : ''}`}
                onClick={handleMobileNavToggle}
            />

            {/* Mobile Navigation Sidebar */}
            <div className={`mobile-nav ${showMobileNav ? 'show' : ''}`}>
                <div className="mobile-nav-header border-bottom bg-white p-3 d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Menu</h5>
                    <button 
                        className="btn p-0" 
                        onClick={handleMobileNavToggle}
                    >
                        <i className="bi bi-x fs-4"></i>
                    </button>
                </div>
                <nav className="mobile-nav-body p-0">
                    <div className="list-group list-group-flush">
                        <NavLink 
                            to="/dashboard" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-house me-2"></i> Home
                        </NavLink>
                        <NavLink 
                            to="/properties" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-building me-2"></i> Properties
                        </NavLink>
                        <NavLink 
                            to="/property-managers" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-people me-2"></i> Property Managers
                        </NavLink>
                        <NavLink 
                            to="/tenants" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-person me-2"></i> Tenants
                        </NavLink>
                        <NavLink 
                            to="/leases" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i> Leases
                        </NavLink>
                        <NavLink 
                            to="/subscription" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-credit-card me-2"></i> Subscription
                        </NavLink>
                        {/* <NavLink 
                            to="/reports" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-bar-graph me-2"></i> Reports
                        </NavLink> */}
                    </div>
                </nav>
            </div>

            {/* Subscription Modal */}
            <SubscriptionModal
                show={showSubscribeModal}
                onHide={() => setShowSubscribeModal(false)}
                onSubscriptionSuccess={handleSubscriptionSuccess}
            />

            {/* Mobile Navigation Overlay */}
        <div 
            className={`mobile-nav-overlay ${showMobileNav ? 'show' : ''}`}
            onClick={handleMobileNavToggle}
        />

        {/* Mobile Navigation Sidebar */}
        <div className={`mobile-nav ${showMobileNav ? 'show' : ''}`}>
                <div className="mobile-nav-header border-bottom bg-white p-3 d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Menu</h5>
                    <button 
                        className="btn p-0" 
                        onClick={handleMobileNavToggle}
                    >
                        <i className="bi bi-x fs-4"></i>
                    </button>
                </div>
                <nav className="mobile-nav-body p-0">
                    <div className="list-group list-group-flush">
                        <NavLink 
                            to="/dashboard" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-house me-2"></i> Home
                        </NavLink>
                        <NavLink 
                            to="/properties" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-building me-2"></i> Properties
                        </NavLink>
                        <NavLink 
                            to="/property-managers" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-people me-2"></i> Property Managers
                        </NavLink>
                        <NavLink 
                            to="/tenants" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-person me-2"></i> Tenants
                        </NavLink>
                        <NavLink 
                            to="/leases" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i> Leases
                        </NavLink>
                        <NavLink 
                            to="/subscription" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-credit-card me-2"></i> Subscription
                        </NavLink>
                        <NavLink 
                            to="/reports" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-bar-graph me-2"></i> Reports
                        </NavLink>
                    </div>
                </nav>
            </div>
            {/* End of Mobile Navigation */}
        </>
    );
}

export default Header;
