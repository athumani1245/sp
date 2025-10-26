import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Form, Alert } from 'react-bootstrap';
import { 
    getLicenseStatus, 
    getSubscriptionPlans, 
    createSubscription,
    startPaymentStatusListener,
    stopPaymentStatusListener
} from '../../services/licenseService';

/**
 * SubscriptionModal Component
 * Handles subscription plan selection, payment processing, and status tracking
 * 
 * @param {boolean} show - Controls modal visibility
 * @param {function} onHide - Callback to close the modal
 * @param {function} onSubscriptionSuccess - Callback when subscription is successful
 */
const SubscriptionModal = ({ show, onHide, onSubscriptionSuccess }) => {
    const [subscribing, setSubscribing] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [subscriptionError, setSubscriptionError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
    const [apiResponseDescription, setApiResponseDescription] = useState('');
    const [currentTransactionId, setCurrentTransactionId] = useState(null);
    const [paymentListener, setPaymentListener] = useState(null);

    // Load subscription plans when modal opens
    useEffect(() => {
        if (show) {
            loadSubscriptionPlans();
        }
    }, [show]);

    const loadSubscriptionPlans = async () => {
        setSubscriptionError('');
        setSubscriptionPlans([]);
        
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

        const planDetails = subscriptionPlans.find(plan => plan.id === selectedPlan);
        setSelectedPlanDetails(planDetails);
        setShowConfirmModal(true);
    };

    const handleCancelSubscription = () => {
        // Stop any active payment listeners
        if (currentTransactionId) {
            stopPaymentStatusListener(currentTransactionId);
        }
        if (paymentListener) {
            paymentListener.stop();
        }
        
        // Reset all states
        setShowConfirmModal(false);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        setPhoneNumber('');
        setSubscriptionError('');
        setSelectedPlanDetails(null);
        setSubscribing(false);
        setPaymentStatus('pending');
        setApiResponseDescription('');
        setCurrentTransactionId(null);
        setPaymentListener(null);
        
        // Close main modal
        onHide();
    };

    const handleSubscribe = async () => {
        setShowConfirmModal(false);
        setShowPaymentModal(true);
        setPaymentStatus('processing');
        setSubscribing(true);
        setSubscriptionError('');
        setApiResponseDescription('');

        try {
            const result = await createSubscription({
                plan: selectedPlan,
                phone_number: `255${phoneNumber}`,
                auto_renew: true
            });

            console.log('API Response:', result);

            if (result.success) {
                setApiResponseDescription(result.description || result.message || '');
                setCurrentTransactionId(result.transactionId);
                
                if (result.requiresUserAction || result.status === 200) {
                    setPaymentStatus('processing');
                    
                    if (result.transactionId) {
                        const listener = startPaymentStatusListener(
                            result.transactionId,
                            (statusUpdate) => {
                                console.log('Payment status update:', statusUpdate);
                                
                                if (statusUpdate.status === 'completed') {
                                    setPaymentStatus('success');
                                    setApiResponseDescription('Payment completed successfully!');
                                    setSubscribing(false);
                                    
                                    setTimeout(() => {
                                        handleSuccessfulSubscription();
                                    }, 3000);
                                    
                                } else if (statusUpdate.status === 'failed' || statusUpdate.status === 'cancelled') {
                                    setPaymentStatus('failed');
                                    setSubscriptionError(statusUpdate.message || 'Payment failed');
                                    setSubscribing(false);
                                    
                                } else if (statusUpdate.status === 'processing') {
                                    if (statusUpdate.message) {
                                        setApiResponseDescription(statusUpdate.message);
                                    }
                                }
                            },
                            {
                                pollInterval: 3000,
                                maxAttempts: 20,
                                onTimeout: (timeoutInfo) => {
                                    console.log('Payment status check timed out:', timeoutInfo);
                                    setPaymentStatus('failed');
                                    setSubscriptionError('Payment verification timed out after 60 seconds. The transaction may still be processing. Please check your mobile money account or contact support for assistance.');
                                    setSubscribing(false);
                                },
                                onError: (errorInfo) => {
                                    console.error('Payment status check error:', errorInfo);
                                }
                            }
                        );
                        
                        setPaymentListener(listener);
                    }
                } else {
                    setPaymentStatus('success');
                    setSubscribing(false);
                    
                    setTimeout(() => {
                        handleSuccessfulSubscription();
                    }, 3000);
                }
            } else {
                setPaymentStatus('failed');
                setSubscriptionError(result.error || 'Failed to create subscription');
                setSubscribing(false);
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            setPaymentStatus('failed');
            setSubscriptionError('Failed to process subscription');
            setSubscribing(false);
        }
    };

    const handleSuccessfulSubscription = () => {
        setShowPaymentModal(false);
        setSelectedPlan(null);
        setPhoneNumber('');
        setSubscriptionError('');
        setSelectedPlanDetails(null);
        setPaymentStatus('pending');
        setApiResponseDescription('');
        setCurrentTransactionId(null);
        setPaymentListener(null);
        
        // Notify parent component
        if (onSubscriptionSuccess) {
            onSubscriptionSuccess();
        }
        
        onHide();
    };

    // Add/remove payment modal class to body for background blur effect
    useEffect(() => {
        if (showPaymentModal) {
            document.body.classList.add('payment-modal-active');
        } else {
            document.body.classList.remove('payment-modal-active');
        }

        return () => {
            document.body.classList.remove('payment-modal-active');
        };
    }, [showPaymentModal]);

    return (
        <>
            {/* Main Subscription Modal */}
            <Modal 
                show={show && !showConfirmModal && !showPaymentModal} 
                onHide={subscribing ? undefined : onHide}
                backdrop={subscribing ? "static" : true}
                keyboard={!subscribing}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-stars text-warning me-2"></i>
                        Subscribe to a Plan
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProceedToConfirmation}>
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
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="card-title mb-0">{plan.name}</h6>
                                                    {selectedPlan === plan.id && (
                                                        <i className="bi bi-check-circle-fill text-danger"></i>
                                                    )}
                                                </div>
                                                <div className="text-success mb-3">
                                                    <strong className="h5">TSh {plan.price.toLocaleString()}</strong>
                                                    <small className="text-muted">/{plan.duration_days} days</small>
                                                </div>
                                                <hr className="my-3" />
                                                <div className="small">
                                                    <strong>Features:</strong>
                                                    <p className="mb-0">{plan.description}</p>
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
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 9) {
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
                            <i className="bi bi-lock-fill me-2"></i>
                            Proceed to Payment
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal 
                show={showConfirmModal} 
                onHide={() => {
                    if (!subscribing) {
                        setShowConfirmModal(false);
                        setSubscriptionError('');
                    }
                }} 
                backdrop={subscribing ? "static" : true}
                keyboard={!subscribing}
                centered
                style={{ zIndex: 1060 }}
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

            {/* Payment Completion Modal */}
            <Modal 
                show={showPaymentModal} 
                onHide={() => {
                    if (paymentStatus !== 'processing') {
                        setShowPaymentModal(false);
                        if (paymentStatus === 'failed') {
                            setShowConfirmModal(true);
                        } else {
                            handleSuccessfulSubscription();
                        }
                    }
                }}
                backdrop={paymentStatus === 'processing' ? "static" : true}
                keyboard={paymentStatus !== 'processing'}
                centered
                className="payment-modal"
                backdropClassName="payment-modal-backdrop"
                contentClassName="payment-modal-content"
                style={{ zIndex: 1070 }}
            >
                <Modal.Header closeButton={paymentStatus !== 'processing'}>
                    <Modal.Title>
                        {paymentStatus === 'processing' && (
                            <>
                                <i className="bi bi-phone text-primary me-2"></i>
                                Complete Payment on Your Phone
                            </>
                        )}
                        {paymentStatus === 'success' && (
                            <>
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Payment Successful
                            </>
                        )}
                        {paymentStatus === 'failed' && (
                            <>
                                <i className="bi bi-x-circle-fill text-danger me-2"></i>
                                Payment Failed
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentStatus === 'processing' && (
                        <div className="text-center py-4">
                            <div className="mb-4">
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                                    <span className="visually-hidden">Processing...</span>
                                </div>
                                <h5 className="mb-3">Waiting for Payment Confirmation</h5>
                            </div>
                            
                            <div className="alert alert-info mb-4">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>
                                    {apiResponseDescription || "Please check your phone for a payment prompt"}
                                </strong>
                            </div>

                            <div className="bg-light p-4 rounded mb-4">
                                <div className="row text-start">
                                    <div className="col-6">
                                        <strong className="text-muted d-block mb-1">Amount:</strong>
                                        <span className="text-success fw-bold">
                                            TSh {selectedPlanDetails ? parseFloat(selectedPlanDetails.price).toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="col-6">
                                        <strong className="text-muted d-block mb-1">Phone:</strong>
                                        <span>+255 {phoneNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-start">
                                <h6 className="mb-3">Follow these steps:</h6>
                                <ol className="list-unstyled">
                                    <li className="mb-2">
                                        <span className="badge bg-primary rounded-circle me-3">1</span>
                                        Check your phone for a USSD prompt
                                    </li>
                                    <li className="mb-2">
                                        <span className="badge bg-primary rounded-circle me-3">2</span>
                                        Enter your PIN when prompted
                                    </li>
                                    <li className="mb-2">
                                        <span className="badge bg-primary rounded-circle me-3">3</span>
                                        Confirm the payment amount and details
                                    </li>
                                    <li className="mb-2">
                                        <span className="badge bg-success rounded-circle me-3">4</span>
                                        Wait for confirmation (this page will update automatically)
                                    </li>
                                </ol>
                            </div>

                            <div className="text-muted small mt-4">
                                <i className="bi bi-clock me-1"></i>
                                This may take a few moments to process...
                            </div>
                        </div>
                    )}

                    {paymentStatus === 'success' && (
                        <div className="text-center py-4">
                            <div className="mb-4">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h4 className="text-success mb-3">Payment Completed Successfully!</h4>
                            <p className="text-muted mb-4">
                                Your subscription has been activated. You can now enjoy all the features of your selected plan.
                            </p>
                            
                            {selectedPlanDetails && (
                                <div className="bg-light p-3 rounded mb-4">
                                    <div className="row">
                                        <div className="col-6">
                                            <strong className="d-block text-muted">Plan:</strong>
                                            <span>{selectedPlanDetails.name}</span>
                                        </div>
                                        <div className="col-6">
                                            <strong className="d-block text-muted">Duration:</strong>
                                            <span>{selectedPlanDetails.duration_days} days</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="alert alert-success">
                                <i className="bi bi-shield-check me-2"></i>
                                Your account has been upgraded successfully!
                            </div>

                            <p className="text-muted small">
                                This modal will close automatically in a few seconds...
                            </p>
                        </div>
                    )}

                    {paymentStatus === 'failed' && (
                        <div className="text-center py-4">
                            <div className="mb-4">
                                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h4 className="text-danger mb-3">Payment Failed</h4>
                            
                            {subscriptionError && (
                                <div className="alert alert-danger mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {subscriptionError}
                                </div>
                            )}

                            <div className="mb-4">
                                <p className="text-muted">
                                    Your payment could not be processed. This might be due to:
                                </p>
                                <ul className="text-start text-muted">
                                    <li>Insufficient balance in your mobile money account</li>
                                    <li>Network connectivity issues</li>
                                    <li>Incorrect PIN entered</li>
                                    <li>Payment timeout</li>
                                </ul>
                            </div>

                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                Please contact support if you need assistance or try the payment process again later.
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {paymentStatus === 'processing' && (
                        <div className="w-100 text-center">
                            <button 
                                className="odoo-btn odoo-btn-secondary"
                                onClick={() => {
                                    if (currentTransactionId) {
                                        stopPaymentStatusListener(currentTransactionId);
                                    }
                                    if (paymentListener) {
                                        paymentListener.stop();
                                    }
                                    
                                    setShowPaymentModal(false);
                                    setShowConfirmModal(true);
                                    setPaymentStatus('pending');
                                    setSubscribing(false);
                                    setCurrentTransactionId(null);
                                    setPaymentListener(null);
                                }}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Cancel Payment
                            </button>
                        </div>
                    )}
                    
                    {paymentStatus === 'success' && (
                        <Button 
                            variant="success" 
                            onClick={handleSuccessfulSubscription}
                            className="w-100"
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Continue
                        </Button>
                    )}

                    {paymentStatus === 'failed' && (
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleCancelSubscription}
                            className="w-100"
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Close
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SubscriptionModal;
