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
import "../../assets/styles/header.css";

function Header() {
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

    const handleUpgradePlan = async () => {
        setShowSubscribeModal(true);
        setShowLicenseModal(false);
        setSubscriptionError('');
        setSubscriptionPlans([]); // Reset plans before fetching new ones
        
        try {
            const plansResult = await getSubscriptionPlans();
            if (plansResult.success) {
                setSubscriptionPlans(plansResult.data);
                console.log('Subscription plans loaded:', plansResult.data);
            } else {
                setSubscriptionError('Failed to load subscription plans');
            }
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
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

        // Find the selected plan details
        const planDetails = subscriptionPlans.find(plan => plan.id === selectedPlan);
        setSelectedPlanDetails(planDetails);
        setShowConfirmModal(true);
    };

    const handleCancelSubscription = () => {
        setShowSubscribeModal(false);
        setShowConfirmModal(false);
        setSelectedPlan(null);
        setPhoneNumber('');
        setSubscriptionError('');
        setSelectedPlanDetails(null);
        setSubscribing(false);
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
                // Reset form states
                setSelectedPlan(null);
                setPhoneNumber('');
                setSubscriptionError('');
                setSelectedPlanDetails(null);
                // Refresh license status
                const licenseResult = await getLicenseStatus();
                if (licenseResult.success) {
                    setLicenseData(licenseResult.data);
                }
            } else {
                setSubscriptionError(result.error || 'Failed to create subscription');
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            setSubscriptionError('Failed to process subscription');
        } finally {
            setSubscribing(false);
        }
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        const access = localStorage.getItem("token");
        if (!access) {
            navigate("/");
            return;
        }

    }, [navigate]);

    // Extracted modal body content to avoid nested ternary
    let licenseModalBody;
    if (loading) {
        licenseModalBody = (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading license information...</p>
            </div>
        );
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
                        <div className="ms-auto d-flex align-items-center">
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
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Close
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleUpgradePlan}
                    >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        {!licenseData?.is_active ? 'Renew Subscription' : 'Upgrade Plan'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Subscription Modal */}
            <Modal 
                show={showSubscribeModal} 
                onHide={() => {
                    setShowSubscribeModal(false);
                    setSelectedPlan(null);
                    setPhoneNumber('');
                    setSubscriptionError('');
                }} 
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
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-stars text-warning me-2"></i>
                        Subscribe to a Plan
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubscribe}>
                    <Modal.Body>
                        {subscriptionError && (
                            <Alert variant="danger" className="mb-4">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {subscriptionError}
                            </Alert>
                        )}

                        <div className="text-center">
                            <h5>Choose Your Plan</h5>
                            <p className="text-muted">Select the plan that best fits your needs</p>
                        </div>

                        {subscriptionPlans.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading plans...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading available plans...</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {subscriptionPlans.map((plan) => (
                                    <div key={plan.id} className="col-md-4">
                                        <div 
                                            className={`card h-100 ${selectedPlan === plan.id ? 'border-danger shadow-sm' : 'border'} ${plan.is_popular ? 'bg-light' : ''}`}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body p-0">
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <h6 className="card-title mb-0">{plan.name}</h6>
                                                    {selectedPlan === plan.id && (
                                                        <i className="bi bi-check-circle-fill text-danger"></i>
                                                    )}
                                                </div>
                                                <div className="text-success mb-3">
                                                    <strong className="h5">TSh {plan.price.toLocaleString()}</strong>
                                                    <small className="text-muted">/{plan.duration_days} days</small>
                                                </div>
                                                {/* <div className="mb-3">
                                                    <p className="text-muted small mb-2">{plan.description}</p>
                                                </div> */}
                                                {/* <div className="small">
                                                    <div className="mb-2">
                                                        <i className="bi bi-building me-2 text-primary"></i>
                                                        {plan.description}
                                                    </div>
                                                </div> */}
                                                <hr className="my-3" />
                                                <div className="small">
                                                    <strong>Features:</strong>
                                                    <p>{plan.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-light p-3 rounded mt-4">
                            <h6 className="mb-3 mt-4">Payment Method</h6>
                            
                            {/* Payment Networks Information */}
                            <div className="row g-3 mb-4">
                                <div className="col-12">
                                    <p className="text-muted small mb-2">Available payment networks:</p>
                                    <div className="d-flex gap-3">
                                        <div className="text-center" style={{ width: '100px' }}>
                                            <img 
                                                src="https://cdn-ilcckcd.nitrocdn.com/vFwIYMXbhaEqIyBSDvrIYygCHfqnLHOc/assets/images/optimized/rev-4c4b0df/yas.co.tz/wp-content/uploads/2024/10/jem_logo.svg" 
                                                alt="Yas Tanzania" 
                                                className="img-fluid mb-2"
                                                style={{ height: '40px', objectFit: 'contain' }}
                                            />
                                            <div className="text-center small text-muted">Yas Tanzania</div>
                                        </div>
                                        <div className="text-center" style={{ width: '100px' }}>
                                            <img 
                                                src="https://cdn-webportal.airtelstream.net/website/tanzania/assets/images/logo.svg" 
                                                alt="Airtel" 
                                                className="img-fluid mb-2"
                                                style={{ height: '40px', objectFit: 'contain' }}
                                            />
                                            <div className="text-center small text-muted">Airtel</div>
                                        </div>
                                        <div className="text-center" style={{ width: '100px' }}>
                                            <img 
                                                src="https://halotel.co.tz/themes/halotel/images/logo4.png" 
                                                alt="Halotel" 
                                                className="img-fluid mb-2"
                                                style={{ height: '40px', objectFit: 'contain' }}
                                            />
                                            <div className="text-center small text-muted">Halotel</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Number Input */}
                            <div className="mb-3">
                                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <img 
                                            src="https://flagcdn.com/w20/tz.png" 
                                            alt="Tanzania flag"
                                            className="me-1"
                                            style={{ height: '15px' }}
                                        />
                                        +255
                                    </span>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="phoneNumber"
                                        placeholder="Enter phone number"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            // Remove any non-digit characters
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 9) {  // Limit to 9 digits after +255
                                                setPhoneNumber(value);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="form-text text-muted">
                                    Enter your mobile money number without the country code
                                </div>
                            </div>

                            <p className="text-muted mb-0 small">
                                <i className="bi bi-shield-check me-1"></i>
                                Your payment will be processed securely via mobile money.
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleCancelSubscription}
                            disabled={subscribing}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleProceedToConfirmation}
                            disabled={!selectedPlan || !phoneNumber || phoneNumber.length !== 9}
                        >
                            {subscribing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-lock-fill me-2"></i>
                                    Proceed to Payment
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal 
                show={showConfirmModal} 
                onHide={() => {
                    setShowConfirmModal(false);
                    setSubscriptionError('');
                }} 
                backdrop={false}
                centered
                style={{
                    zIndex: 1060,
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)'
                }}
                className="confirmation-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Confirm Payment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPlanDetails && (
                        <div>
                            <h6 className="mb-4">Please confirm your subscription details:</h6>
                            
                            <div className="bg-light p-3 rounded mb-4">
                                <div className="row mb-3">
                                    <div className="col-5 text-muted">Selected Plan:</div>
                                    <div className="col-7 fw-bold">{selectedPlanDetails.name}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-5 text-muted">Duration:</div>
                                    <div className="col-7">{selectedPlanDetails.duration_days} days</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-5 text-muted">Amount:</div>
                                    <div className="col-7 fw-bold text-success">
                                        TSh {parseFloat(selectedPlanDetails.price).toLocaleString()}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-5 text-muted">Phone Number:</div>
                                    <div className="col-7">+255 {phoneNumber}</div>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                A payment prompt will be sent to your phone. Please enter your PIN to complete the payment.
                            </div>

                            {subscriptionError && (
                                <Alert variant="danger" className="mt-3">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {subscriptionError}
                                </Alert>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => {
                            setShowConfirmModal(false);
                            setSubscriptionError('');
                        }}
                        disabled={subscribing}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleSubscribe}
                        disabled={subscribing}
                    >
                        {subscribing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check2-circle me-2"></i>
                                Confirm & Pay
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

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
                    </div>
                </nav>
            </div>
            {/* End of Mobile Navigation */}
        </>
    );
}

export default Header;