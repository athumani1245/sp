import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Modal, Button, Badge } from "react-bootstrap";
import { logout } from "../../services/authService";
import { useSubscriptionModal } from "../../context/SubscriptionModalContext";
import { getLicenseStatus } from "../../services/licenseService";
import SubscriptionModal from "../forms/SubscriptionModal";
import LicenseInfoSkeleton from "../skeletons/LicenseInfoSkeleton";
import "../../assets/styles/header.css";

function Header() {
    const navigate = useNavigate();
    const { registerModalOpener } = useSubscriptionModal();
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [licenseData, setLicenseData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        await logout(navigate);
    }

    const handleShowLicenseStatus = async () => {
        setShowLicenseModal(true);
        setLoading(true);
        try {
            const result = await getLicenseStatus();
            if (result.success) {
                console.log('License data received:', result.data);
                setLicenseData(result.data);
            } else {
                console.error('Failed to fetch license status:', result.error);
                setLicenseData(null);
            }
        } catch (error) {
            console.error('Error fetching license status:', error);
            setLicenseData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradePlan = useCallback(() => {
        setShowSubscribeModal(true);
        setShowLicenseModal(false);
    }, []);

    // Register the modal opener with context
    useEffect(() => {
        registerModalOpener(handleUpgradePlan);
    }, [handleUpgradePlan, registerModalOpener]);

    const handleSubscriptionSuccess = async () => {
        // Refresh license status after successful subscription
        try {
            const licenseResult = await getLicenseStatus();
            if (licenseResult.success) {
                setLicenseData(licenseResult.data);
            }
        } catch (error) {
            console.error('Error refreshing license status:', error);
        }
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }
    }, []);

    // Extracted modal body content to avoid nested ternary
    let licenseModalBody;
    if (loading) {
        licenseModalBody = <LicenseInfoSkeleton />;
    } else if (licenseData) {
        licenseModalBody = (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Current Plan</h5>
                    <Badge bg={licenseData.is_active ? 'success' : 'danger'}>
                        {licenseData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                
                <div className="bg-light p-3 rounded mb-4">
                    <div className="row">
                        <div className="col-6">
                            <strong className="d-block">Plan Details</strong>
                            <span className="text-muted">
                                {licenseData.plan?.name || licenseData.plan || 'N/A'}
                            </span>
                        </div>
                        <div className="col-6">
                            <strong className="d-block">Expiry Date</strong>
                            <span className="text-muted">
                                {licenseData.end_date ? new Date(licenseData.end_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                    {licenseData.end_date && (() => {
                        const endDate = new Date(licenseData.end_date);
                        const today = new Date();
                        const timeDiff = endDate.getTime() - today.getTime();
                        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        
                        return daysRemaining > 0 ? (
                            <div className="alert alert-info mt-3 mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                {daysRemaining} days remaining
                            </div>
                        ) : (
                            <div className="alert alert-warning mt-3 mb-0">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Subscription has expired
                            </div>
                        );
                    })()}
                </div>

                <div>
                    <h6>Plan Information:</h6>
                    <div className="bg-light p-3 rounded">
                        {licenseData.plan?.description ? (
                            <p className="mb-2">{licenseData.plan.description}</p>
                        ) : (
                            <p className="text-muted mb-2">Plan details not available</p>
                        )}
                        
                        <div className="row">
                            <div className="col-6">
                                <small className="text-muted d-block">Start Date</small>
                                <span>{licenseData.start_date ? new Date(licenseData.start_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="col-6">
                                <small className="text-muted d-block">Duration</small>
                                <span>
                                    {licenseData.plan?.duration_days ? `${licenseData.plan.duration_days} days` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        licenseModalBody = (
            <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>&nbsp;
                Failed to load license information
            </div>
        );
    }

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
                        <div className="ms-auto d-flex align-items-right">
                            <button className="btn btn-link d-none d-lg-block p-1 text-dark me-2">
                                <i className="bi bi-bell fs-5"></i>
                            </button>
                            
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
                                    <li>
                                        <button className="dropdown-item" onClick={handleShowLicenseStatus}>
                                            <i className="bi bi-shield-check me-2"></i>License Status
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item">
                                            <i className="bi bi-gear me-2"></i>Settings
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
                            to="/leases" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i> Leases
                        </NavLink>
                        <NavLink 
                            to="/tenants" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-person me-2"></i> Tenants
                        </NavLink>
                        <NavLink 
                            to="/reports" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i> Reports
                        </NavLink>
                    </div>
                </nav>
            </div>

            <Modal show={showLicenseModal} onHide={() => setShowLicenseModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={`bi ${licenseData?.is_active ? 'bi-shield-check text-success' : 'bi-shield-x text-danger'} me-2`}></i>
                        License Status
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {licenseModalBody}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowLicenseModal(false)}
                        className="odoo-btn odoo-btn-secondary"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Close
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleUpgradePlan}
                        className="odoo-btn odoo-btn-primary"
                    >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        {!licenseData?.is_active ? 'Renew Subscription' : 'Upgrade Plan'}
                    </Button>
                </Modal.Footer>
            </Modal>

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
                            to="/leases" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i> Leases
                        </NavLink>
                        <NavLink 
                            to="/tenants" 
                            className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-person me-2"></i> Tenants
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