import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Badge, Form, Alert } from "react-bootstrap";
import { logout } from "../../services/authService";
import { 
    getLicenseStatus, 
    getSubscriptionPlans, 
    createSubscription 
} from "../../services/licenseService";

function Header() {
    const navigate = useNavigate();
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [licenseData, setLicenseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [subscriptionError, setSubscriptionError] = useState('');

    const handleLogout = async () => {
        await logout(navigate);
    }

    const handleShowLicenseStatus = async () => {
        setShowLicenseModal(true);
        setLoading(true);
        try {
            const result = await getLicenseStatus();
            if (result.success) {
                setLicenseData(result.data);
            }
            
            // Also fetch subscription plans
            const plansResult = await getSubscriptionPlans();
            if (plansResult.success) {
                setSubscriptionPlans(plansResult.data);
            }
        } catch (error) {
            console.error('Error fetching license status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!selectedPlan) {
            setSubscriptionError('Please select a plan');
            return;
        }

        setSubscribing(true);
        setSubscriptionError('');

        try {
            const result = await createSubscription({
                plan: selectedPlan,
                auto_renew: true
            });

            if (result.success) {
                setShowSubscribeModal(false);
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
                            <span className="text-muted">{new Date(licenseData.expiry_date).toLocaleDateString()}</span>
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
        );
    } else {
        licenseModalBody = (
            <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>&nbsp;
                Failed to load license information
            </div>
        );
    }

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
                    <li>
                        <button className="dropdown-item" type="button" onClick={handleShowLicenseStatus}>
                            License Status
                        </button>
                    </li>
                    <li><button className="dropdown-item" type="button">Settings</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>

            {/* License Status Modal */}
            <Modal show={showLicenseModal} onHide={() => setShowLicenseModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={`bi ${licenseData?.status === 'active' ? 'bi-shield-check text-success' : 'bi-shield-x text-danger'} me-2`}></i>
                        License Status
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {licenseModalBody}
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
                        onClick={() => {
                            setShowSubscribeModal(true);
                            setShowLicenseModal(false);
                        }}
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

                        <div className="text-center mb-4">
                            <h5>Choose Your Plan</h5>
                            <p className="text-muted">Select the plan that best fits your needs</p>
                        </div>

                        <div className="row g-3">
                            {subscriptionPlans.map((plan) => (
                                <div key={plan.id} className="col-md-4">
                                    <div 
                                        className={`card ${selectedPlan === plan.id ? 'border-primary' : 'border'}`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="card-title mb-0">{plan.name}</h6>
                                                {selectedPlan === plan.id && (
                                                    <i className="bi bi-check-circle-fill text-primary"></i>
                                                )}
                                            </div>
                                            <div className="text-success mb-2">
                                                <strong>TSh {plan.price.toLocaleString()}</strong>
                                                <small className="text-muted">/{plan.billing_cycle}</small>
                                            </div>
                                            <div className="small text-muted">
                                                {plan.features[0]}
                                                {plan.features.length > 1 && ` + ${plan.features.length - 1} more features`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-light p-3 rounded mt-4">
                            <h6>Payment Information</h6>
                            <p className="text-muted mb-0 small">
                                By proceeding, you'll be redirected to our secure payment gateway.
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowSubscribeModal(false)}
                            disabled={subscribing}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={subscribing || !selectedPlan}
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
        </div>
    );
}
export default Header;