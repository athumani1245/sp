import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Modal, Button, Badge, Form, Alert } from "react-bootstrap";
import { logout } from "../../services/authService";
import { 
    getLicenseStatus, 
    getSubscriptionPlans, 
    createSubscription 
} from "../../services/licenseService";
import TourHelpButton from "../TourHelpButton";
import "../../assets/styles/header.css";

function Header({ toggleSidenav }) {
    const navigate = useNavigate();
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [licenseData, setLicenseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [subscriptionError, setSubscriptionError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

    const handleLogout = async () => {
        await logout(navigate);
    }

    const handleMobileNavToggle = () => {
        setShowMobileNav(!showMobileNav);
        document.body.style.overflow = !showMobileNav ? 'hidden' : '';
    };

    const handleShowLicenseStatus = async () => {
        setShowLicenseModal(true);
        setLoading(true);
        try {
            const result = await getLicenseStatus();
            if (result.success) {
                setLicenseData(result.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradePlan = async () => {
        setShowSubscribeModal(true);
        setShowLicenseModal(false);
        setSubscriptionError('');
        setSubscriptionPlans([]); // Reset plans before fetching new ones
        
        try {
            const plansResult = await getSubscriptionPlans();
            if (plansResult.success) {
                setSubscriptionPlans(plansResult.data);
            } else {
                setSubscriptionError('Failed to load subscription plans');
            }
        } catch (error) {
            setSubscriptionError('An error occurred while loading plans');
        }
    };

    const handleProceedToConfirmation = (e) => {
        e.preventDefault();
        if (!selectedPlan) {
            setSubscriptionError('Please select a plan');
            return;
        }
        if (!phoneNumber || phoneNumber.length !== 9) {
            setSubscriptionError('Please enter a valid 9-digit phone number');
            return;
        }

        const planDetails = subscriptionPlans.find(plan => plan.id === selectedPlan);
        setSelectedPlanDetails(planDetails);
        setShowConfirmModal(true);
    };

    const handleSubscribe = async () => {
        setSubscribing(true);
        setSubscriptionError('');

        try {
            const result = await createSubscription({
                plan: selectedPlan,
                phone_number: `255${phoneNumber}`,
                auto_renew: true
            });

            if (result.success) {
                setShowConfirmModal(false);
                setShowSubscribeModal(false);
                const licenseResult = await getLicenseStatus();
                if (licenseResult.success) {
                    setLicenseData(licenseResult.data);
                }
            } else {
                setSubscriptionError(result.error || 'Failed to create subscription');
            }
        } catch (error) {
            setSubscriptionError('Failed to process subscription');
        } finally {
            setSubscribing(false);
        }
    };

    useEffect(() => {
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }
    }, [navigate]);

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
                            {/* Tour Help Button */}
                            <TourHelpButton />
                            
                            {/* Bell icon - Hidden on mobile */}
                            <button className="btn btn-link d-none d-lg-block p-1 text-dark">
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
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" 
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
                aria-hidden="true"
            ></div>

            {/* Mobile Navigation */}
            <nav className={`mobile-nav d-lg-none ${showMobileNav ? 'show' : ''}`}>
                <div className="mobile-nav-header border-bottom bg-white p-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">Menu</h5>
                        <button 
                            className="btn p-0" 
                            onClick={handleMobileNavToggle}
                        >
                            <i className="bi bi-x fs-4"></i>
                        </button>
                    </div>
                </div>
                <div className="mobile-nav-body">
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
                    </div>
                </div>
            </nav>

            {/* License Status Modal */}
            <Modal show={showLicenseModal} onHide={() => setShowLicenseModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={`bi ${licenseData?.status === 'active' ? 'bi-shield-check text-success' : 'bi-shield-x text-danger'} me-2`}></i>
                        License Status
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading license information...</p>
                        </div>
                    ) : licenseData ? (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Current Plan</h5>
                                <Badge bg={licenseData.status === 'active' ? 'success' : 'danger'}>
                                    {licenseData.status === 'active' ? 'Active' : 'Expired'}
                                </Badge>
                            </div>
                            
                            <div className="bg-light p-3 rounded mb-4">
                                <div className="row">
                                    <div className="col-6">
                                        <strong className="d-block">Plan Details</strong>
                                        <span className="text-muted">{licenseData.plan}</span>
                                    </div>
                                    <div className="col-6">
                                        <strong className="d-block">Expiry Date</strong>
                                        <span className="text-muted">
                                            {new Date(licenseData.expiry_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {licenseData.days_remaining > 0 && (
                                    <div className="alert alert-info mt-3 mb-0">
                                        <i className="bi bi-info-circle me-2"></i>
                                        {licenseData.days_remaining} days remaining
                                    </div>
                                )}
                            </div>

                            <div>
                                <h6>Features Included:</h6>
                                <ul className="list-unstyled">
                                    {licenseData.features.map((feature) => (
                                        <li key={feature.id || feature} className="mb-2">
                                            <i className="bi bi-check2 text-success me-2"></i>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Failed to load license information
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowLicenseModal(false)}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpgradePlan}
                    >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        {licenseData?.status === 'expired' ? 'Renew Subscription' : 'Upgrade Plan'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Subscription Modal */}
            <Modal 
                show={showSubscribeModal} 
                onHide={() => setShowSubscribeModal(false)} 
                backdrop="static"
                size="lg"
                className={showConfirmModal ? 'modal-blur' : ''}
                style={{
                    opacity: showConfirmModal ? '0.6' : '1',
                    filter: showConfirmModal ? 'blur(4px)' : 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: showConfirmModal ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                    boxShadow: showConfirmModal ? '0 0 20px rgba(0, 0, 0, 0.3)' : 'none'
                }}
            >
                {/* ... (rest of the modals code remains the same) ... */}
            </Modal>
        </>
    );
}

export default Header;