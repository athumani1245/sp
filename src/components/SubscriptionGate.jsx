import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';

/**
 * SubscriptionGate Component
 * Wraps features that require an active subscription
 * Shows a modal or overlay when subscription is inactive
 */
const SubscriptionGate = ({ children, feature = "this feature" }) => {
    const { hasActiveSubscription, subscription } = useAuth();
    const [showModal, setShowModal] = React.useState(false);

    const handleFeatureClick = (e) => {
        if (!hasActiveSubscription) {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
        }
    };

    if (!hasActiveSubscription) {
        return (
            <>
                <div 
                    onClick={handleFeatureClick}
                    style={{ 
                        position: 'relative',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                        pointerEvents: 'all'
                    }}
                >
                    <div style={{ pointerEvents: 'none' }}>
                        {children}
                    </div>
                    <div 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            zIndex: 1
                        }}
                    >
                        <div className="text-center">
                            <i className="bi bi-lock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                            <p className="mb-0 mt-2 fw-bold">Subscription Required</p>
                        </div>
                    </div>
                </div>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title>
                            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                            Subscription Required
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center py-3">
                            <i className="bi bi-lock-fill text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="mb-3">Access {feature}</h5>
                            <p className="text-muted mb-4">
                                {subscription && subscription.status === 'inactive' ? (
                                    <>Your subscription has expired. Please renew to continue using all features.</>
                                ) : (
                                    <>You need an active subscription to access {feature}.</>
                                )}
                            </p>
                            
                            {subscription && (
                                <div className="alert alert-info">
                                    <small>
                                        <strong>Current Plan:</strong> {subscription.plan_name || 'No active plan'}<br/>
                                        <strong>Status:</strong> <span className="text-danger">{subscription.status || 'Inactive'}</span>
                                        {subscription.end_date && (
                                            <>
                                                <br/><strong>Ended:</strong> {subscription.end_date}
                                            </>
                                        )}
                                    </small>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                setShowModal(false);
                                window.location.href = '/subscription'; // Replace with your subscription page route
                            }}
                        >
                            <i className="bi bi-credit-card me-2"></i>
                            Subscribe Now
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    return <>{children}</>;
};

export default SubscriptionGate;
