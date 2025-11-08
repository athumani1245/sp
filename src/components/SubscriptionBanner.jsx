import React from 'react';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useSubscriptionModal } from '../context/SubscriptionModalContext';

/**
 * SubscriptionBanner Component
 * Displays subscription status alerts at the top of the dashboard
 */
const SubscriptionBanner = () => {
    const { subscription, hasActiveSubscription } = useAuth();
    const { triggerSubscriptionModal } = useSubscriptionModal();
    const [dismissed, setDismissed] = React.useState(false);

    if (!subscription || dismissed) {
        return null;
    }

    const handleSubscribe = () => {
        triggerSubscriptionModal();
    };

    // Show warning if subscription is inactive
    if (!hasActiveSubscription) {
        return (
            <Alert 
                variant="danger" 
                dismissible 
                onClose={() => setDismissed(true)}
                className="mb-3 d-flex align-items-center justify-content-between"
            >
                <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                        <strong>Subscription Expired</strong>
                        <p className="mb-0 small">
                            Your subscription has expired. Subscribe now to continue accessing all features.
                        </p>
                    </div>
                </div>
                <button 
                    className="btn btn-light btn-sm ms-3"
                    onClick={handleSubscribe}
                >
                    <i className="bi bi-credit-card me-1"></i>
                    Subscribe Now
                </button>
            </Alert>
        );
    }

    // Show warning if subscription is ending soon (less than 7 days)
    if (subscription.days_left <= 7 && subscription.days_left > 0) {
        return (
            <Alert 
                variant="warning" 
                dismissible 
                onClose={() => setDismissed(true)}
                className="mb-3 d-flex align-items-center justify-content-between"
            >
                <div className="d-flex align-items-center">
                    <i className="bi bi-clock-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                        <strong>Subscription Ending Soon!</strong>
                        <p className="mb-0 small">
                            Your subscription expires in <strong>{subscription.days_left} day{subscription.days_left !== 1 ? 's' : ''}</strong>.
                            Renew now to avoid service interruption.
                        </p>
                    </div>
                </div>
                <button 
                    className="odoo-btn odoo-btn-secondary me-3"
                    onClick={handleSubscribe}
                >
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Renew Now
                </button>
            </Alert>
        );
    }

    // Show reminder if subscription is less than 30 days
    if (subscription.days_left < 30 && subscription.days_left > 7) {
        return (
            <Alert 
                variant="info" 
                dismissible 
                onClose={() => setDismissed(true)}
                className="mb-3 d-flex align-items-center justify-content-between"
            >
                <div className="d-flex align-items-center">
                    <i className="bi bi-bell-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                        <strong>Subscription Renewal Reminder</strong>
                        <p className="mb-0 small">
                            Your subscription will expire in <strong>{subscription.days_left} days</strong>.
                            Plan ahead and renew to continue enjoying uninterrupted service.
                        </p>
                    </div>
                </div>
                <button 
                    className="odoo-btn odoo-btn-secondary me-3"
                    onClick={handleSubscribe}
                >
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Renew Now
                </button>
            </Alert>
        );
    }

    // Show info if on trial
    if (subscription.is_trial && subscription.days_left >= 30) {
        return (
            <Alert 
                variant="info" 
                dismissible 
                onClose={() => setDismissed(true)}
                className="mb-3 d-flex align-items-center justify-content-between"
            >
                <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                        <strong>Trial Period Active</strong>
                        <p className="mb-0 small">
                            You have <strong>{subscription.days_left} days</strong> remaining in your trial period.
                            Plan: <strong>{subscription.plan_name}</strong> | Max Units: <strong>{subscription.max_units}</strong>
                        </p>
                    </div>
                </div>
            </Alert>
        );
    }

    return null;
};

export default SubscriptionBanner;
