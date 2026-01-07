import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Modal } from "react-bootstrap";
import "../assets/styles/profile.css";
import Layout from "../components/Layout";
import { useSubscription } from '../hooks/useSubscription';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
    getSubscriptionPlans, 
    getCurrentSubscription,
    createSubscription,
    startPaymentStatusListener,
    stopPaymentStatusListener,
    getBillingHistory
} from '../services/licenseService';

function Subscription() {
    usePageTitle('Subscription');
    const navigate = useNavigate();
    const { subscription, hasActiveSubscription } = useSubscription();
    const [loading, setLoading] = useState(true);
    const [autoRenew, setAutoRenew] = useState(false);
    const [showUpgradePlans, setShowUpgradePlans] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPlans, setSelectedPlans] = useState({});
    const [detailedSubscription, setDetailedSubscription] = useState(null);
    const [billingHistory, setBillingHistory] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [subscriptionError, setSubscriptionError] = useState('');
    const [apiResponseDescription, setApiResponseDescription] = useState('');
    const [currentTransactionId, setCurrentTransactionId] = useState(null);
    const [paymentListener, setPaymentListener] = useState(null);
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
    const [subscribing, setSubscribing] = useState(false);
    const plansRef = useRef(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        
        fetchCurrentSubscription();
        setLoading(false);
    }, [navigate]);

    const fetchCurrentSubscription = async () => {
        try {
            const response = await getCurrentSubscription();
            if (response.success && response.data) {
                setDetailedSubscription(response.data);
            }
        } catch (error) {
        }
        
        // Fetch billing history
        try {
            const billingResponse = await getBillingHistory();
            if (billingResponse.success && billingResponse.data) {
                // Limit to last 5 records
                setBillingHistory(billingResponse.data);
            }
        } catch (error) {
        }
    };

    const fetchSubscriptionPlans = async () => {
        setPlansLoading(true);
        try {
            const response = await getSubscriptionPlans();
            
            if (response.success && response.data) {
                // Transform the API data to match our display format
                const transformedPlans = response.data.map(pkg => {
                    const features = [];
                    
                    // Build features array based on package properties
                    if (pkg.max_units) {
                        features.push(`Up to ${pkg.max_units} units`);
                    }
                    if (pkg.max_property_managers) {
                        features.push(`Up to ${pkg.max_property_managers} property managers`);
                    }
                    if (pkg.allow_sms_notifications) {
                        features.push('SMS Notifications');
                    }
                    if (pkg.description) {
                        features.push(pkg.description);
                    }
                    
                    return {
                        id: pkg.id,
                        name: pkg.name,
                        price: pkg.price || 0,
                        duration: pkg.duration_days ? `${pkg.duration_days} days` : 'month',
                        max_units: pkg.max_units,
                        features: features.length > 0 ? features : ['Contact us for details'],
                        plans: pkg.plans || [] // Preserve nested plans
                    };
                });
                
                setPlans(transformedPlans);
            } else {
            }
        } catch (error) {
        } finally {
            setPlansLoading(false);
        }
    };

    const handleUpgradeClick = () => {
        setShowUpgradePlans(true);
        if (plans.length === 0) {
            fetchSubscriptionPlans();
        }
        // Scroll to plans section after a short delay to ensure it's rendered
        setTimeout(() => {
            plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSelectPackage = (pkg) => {
        // Reset any previously selected plans
        setSelectedPlans({});
        
        if (pkg.plans && pkg.plans.length > 0) {
            setSelectedPackage(pkg);
            setShowPlansModal(true);
        } else {
            // If no nested plans, handle direct subscription
            // TODO: Implement direct subscription logic
        }
    };

    const handleCloseModal = () => {
        setShowPlansModal(false);
        setSelectedPackage(null);
    };

    const handleSelectPlan = (plan) => {
        // Store the selected plan for this package
        setSelectedPlans(prev => ({
            ...prev,
            [selectedPackage.id]: plan
        }));
        handleCloseModal();
    };

    const handleProceedToPayment = (packageId) => {
        const selectedPlan = selectedPlans[packageId];
        setSelectedPlanForPayment(selectedPlan);
        setShowPaymentModal(true);
        setPaymentStatus('input');
        setPhoneNumber('');
        setSubscriptionError('');
    };

    const handleCancelPlanSelection = (packageId) => {
        setSelectedPlans(prev => {
            const updated = { ...prev };
            delete updated[packageId];
            return updated;
        });
    };

    const handleSubscribePayment = async () => {
        if (!phoneNumber || phoneNumber.length !== 9) {
            setSubscriptionError('Please enter a valid 9-digit phone number');
            return;
        }

        setPaymentStatus('processing');
        setSubscribing(true);
        setSubscriptionError('');
        setApiResponseDescription('');

        try {
            const planId = selectedPlanForPayment?.id;
            
            if (!planId) {
                setPaymentStatus('failed');
                setSubscriptionError('Invalid plan selection. Please try again.');
                setSubscribing(false);
                return;
            }
            
            const result = await createSubscription({
                plan: planId,
                phone_number: `255${phoneNumber}`,
                auto_renew: true
            });

            if (result.success) {
                setApiResponseDescription(result.description || result.message || '');
                setCurrentTransactionId(result.transactionId);
                
                if (result.requiresUserAction || result.status === 200) {
                    setPaymentStatus('processing');
                    
                    if (result.transactionId) {
                        const listener = startPaymentStatusListener(
                            result.transactionId,
                            (statusUpdate) => {
                                
                                const paymentStatusValue = statusUpdate.paymentStatus?.toUpperCase();
                                
                                if (paymentStatusValue === 'PAYMENT_ACCEPTED' || paymentStatusValue === 'PAYMENT_SUCCESS') {
                                    setPaymentStatus('success');
                                    setApiResponseDescription(statusUpdate.data?.narration || 'Payment completed successfully!');
                                    setSubscribing(false);
                                    
                                    setTimeout(() => {
                                        handlePaymentSuccess();
                                    }, 3000);
                                    
                                } else if (paymentStatusValue === 'PAYMENT_FAILED' || paymentStatusValue === 'PAYMENT_CANCELLED') {
                                    setPaymentStatus('failed');
                                    setSubscriptionError(statusUpdate.message || statusUpdate.data?.narration || 'Payment failed');
                                    setSubscribing(false);
                                    
                                } else if (paymentStatusValue === 'PAYMENT_PENDING' || paymentStatusValue === 'PAYMENT_PROCESSING') {
                                    setPaymentStatus('processing');
                                    if (statusUpdate.message || statusUpdate.data?.narration) {
                                        setApiResponseDescription(statusUpdate.message || statusUpdate.data?.narration);
                                    }
                                }
                            },
                            {
                                pollInterval: 3000,
                                maxAttempts: 20,
                                onTimeout: (timeoutInfo) => {
                                    setPaymentStatus('failed');
                                    setSubscriptionError('Payment verification timed out. Please check your mobile money account.');
                                    setSubscribing(false);
                                },
                                onError: (errorInfo) => {
                                }
                            }
                        );
                        
                        setPaymentListener(listener);
                    }
                } else {
                    setPaymentStatus('success');
                    setSubscribing(false);
                    
                    setTimeout(() => {
                        handlePaymentSuccess();
                    }, 3000);
                }
            } else {
                setPaymentStatus('failed');
                setSubscriptionError(result.error || 'Failed to create subscription');
                setSubscribing(false);
            }
        } catch (error) {
            setPaymentStatus('failed');
            setSubscriptionError('Failed to process subscription');
            setSubscribing(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setPaymentStatus('pending');
        setPhoneNumber('');
        setSubscriptionError('');
        setApiResponseDescription('');
        setCurrentTransactionId(null);
        setPaymentListener(null);
        setSelectedPlanForPayment(null);
        setSelectedPlans({});
        
        // Refresh subscription data
        fetchCurrentSubscription();
        
        // Show success message
        alert('Subscription activated successfully!');
    };

    const handleClosePaymentModal = () => {
        if (paymentStatus === 'processing') return;
        
        if (currentTransactionId) {
            stopPaymentStatusListener(currentTransactionId);
        }
        if (paymentListener) {
            paymentListener.stop();
        }
        
        setShowPaymentModal(false);
        setPaymentStatus('pending');
        setPhoneNumber('');
        setSubscriptionError('');
        setApiResponseDescription('');
        setCurrentTransactionId(null);
        setPaymentListener(null);
        setSubscribing(false);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="main-content">
                    <div className="profile-container">
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Layout>
                <div className="main-content">
                    <div className="profile-container">
                        <div className="row">
                        {/* Main Content */}
                        <div className="col-12">
                            {/* Plan Section */}
                            <div className="mb-4">
                                <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Plan</h5>
                                
                                <div className="row">
                                    {/* Current Plan Card */}
                                    <div className="col-md-6 mb-3">
                                        <div style={{
                                            border: subscription ? '2px solid #17a2b8' : '1px solid #e3e6e8',
                                            borderRadius: '8px',
                                            padding: '1.5rem',
                                            backgroundColor: '#fff',
                                            position: 'relative',
                                            height: '100%'
                                        }}>
                                            {subscription && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '20px',
                                                    backgroundColor: '#17a2b8',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <i className="bi bi-check" style={{ color: 'white', fontSize: '1rem' }}></i>
                                                </div>
                                            )}
                                            
                                            <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: '1rem' }}>
                                                {subscription && (
                                                    <div>
                                                        <div style={{ marginBottom: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 }}>Package Name: </span>
                                                            <span style={{ fontSize: '0.9rem', color: '#222', fontWeight: 600 }}>
                                                                {subscription.package_name || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 }}>Plan: </span>
                                                            <span style={{ fontSize: '0.9rem', color: '#222', fontWeight: 600 }}>
                                                                {subscription.plan_name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {subscription && (
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CC5B4B' }}>
                                                            {subscription.days_left}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                                            days remaining
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {subscription && (
                                                <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #e3e6e8' }}>
                                                    <div className="row">
                                                        <div className="col-6 mb-2">
                                                            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Start Date</p>
                                                            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
                                                                {formatDate(subscription.start_date)}
                                                            </p>
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>End Date</p>
                                                            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
                                                                {formatDate(subscription.end_date)}
                                                            </p>
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Maximum Units</p>
                                                            <p style={{ fontSize: '0.8rem', color: '#222', marginBottom: 0, fontWeight: 500 }}>
                                                                {subscription.max_units || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <p style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '0.25rem' }}>Status</p>
                                                            <p style={{ fontSize: '0.8rem', color: hasActiveSubscription ? '#28a745' : '#dc3545', marginBottom: 0, fontWeight: 600 }}>
                                                                {hasActiveSubscription ? 'Active' : 'Expired'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {subscription && (
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        className="odoo-btn"
                                                        style={{ 
                                                            flex: 1,
                                                            border: '2px solid #CC5B4B',
                                                            backgroundColor: 'transparent',
                                                            color: '#CC5B4B',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onClick={handleUpgradeClick}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#CC5B4B';
                                                            e.currentTarget.style.color = 'white';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.color = '#CC5B4B';
                                                        }}
                                                    >
                                                        Upgrade
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Billing History */}
                                    <div className="col-md-6 mb-3">
                                        <div style={{
                                            border: '1px solid #e3e6e8',
                                            borderRadius: '8px',
                                            padding: '1.5rem',
                                            backgroundColor: '#fff',
                                            height: '100%'
                                        }}>
                                            <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Billing History</h5>
                                            
                                            <div className="table-responsive">
                                                {billingHistory.length === 0 ? (
                                                    <div className="text-center py-4 text-muted">
                                                        <i className="bi bi-receipt" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                                        <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>No billing history available</p>
                                                    </div>
                                                ) : (
                                                    <table className="table table-sm" style={{ fontSize: '0.8rem' }}>
                                                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                            <tr>
                                                                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem' }}>Date</th>
                                                                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem' }}>Package</th>
                                                                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {billingHistory.slice(0, 5).map((billing, index) => (
                                                                <tr key={billing.id || index}>
                                                                    <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8' }}>
                                                                        {billing.payment_date || 'N/A'}
                                                                    </td>
                                                                    <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8', fontSize: '0.75rem', color: '#6c757d' }}>
                                                                        {billing.package_name} - {billing.plan_name || 'N/A'}
                                                                    </td>
                                                                    <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8', fontWeight: 600, color: '#28a745', textAlign: 'right' }}>
                                                                        TSH {parseFloat(billing.amount || 0).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Available Plans Section */}
                            {showUpgradePlans && (
                                <div className="mb-4" ref={plansRef}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Available Packages</h5>
                                        <button 
                                            className="btn btn-sm btn-link"
                                            onClick={() => setShowUpgradePlans(false)}
                                            style={{ color: '#6c757d', textDecoration: 'none' }}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                    
                                    {plansLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading plans...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {plans.map((plan) => (
                                                <div key={plan.id} className="col-md-4 mb-3">
                                                    <div style={{
                                                        border: selectedPlans[plan.id] ? '2px solid #28a745' : '1px solid #e3e6e8',
                                                        borderRadius: '8px',
                                                        padding: '1.5rem',
                                                        backgroundColor: '#fff',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        position: 'relative'
                                                    }}>
                                                        {selectedPlans[plan.id] && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-10px',
                                                                right: '15px',
                                                                backgroundColor: '#28a745',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                height: '28px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
                                                            }}>
                                                                <i className="bi bi-check-lg" style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}></i>
                                                            </div>
                                                        )}
                                                        
                                                        <h5 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                            {plan.name}
                                                        </h5>
                                                        
                                                        {selectedPlans[plan.id] && (
                                                            <div style={{ 
                                                                backgroundColor: '#d4edda', 
                                                                border: '1px solid #c3e6cb',
                                                                borderRadius: '6px',
                                                                padding: '0.5rem',
                                                                marginBottom: '1rem'
                                                            }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#155724', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                                    Selected Plan:
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#155724', fontWeight: 700 }}>
                                                                    {selectedPlans[plan.id].name}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#155724' }}>
                                                                    TSH {parseFloat(selectedPlans[plan.id].price).toLocaleString()} / {selectedPlans[plan.id].duration_days} days
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <div style={{ marginBottom: '1.5rem', flex: 1, textAlign: 'left' }}>
                                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#222', marginBottom: '0.75rem', textAlign: 'left' }}>
                                                                Features:
                                                            </p>
                                                            <ul style={{ paddingLeft: '1.25rem', marginBottom: 0, textAlign: 'left', listStylePosition: 'outside' }}>
                                                                {plan.features.map((feature, index) => (
                                                                    <li key={index} style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                                                                        {feature}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className="odoo-btn"
                                                                style={{ 
                                                                    flex: selectedPlans[plan.id] ? 1 : '1 1 auto',
                                                                    border: '2px solid #CC5B4B',
                                                                    backgroundColor: 'transparent',
                                                                    color: '#CC5B4B',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onClick={() => selectedPlans[plan.id] ? handleCancelPlanSelection(plan.id) : handleSelectPackage(plan)}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#CC5B4B';
                                                                    e.currentTarget.style.color = 'white';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.color = '#CC5B4B';
                                                                }}
                                                            >
                                                                {selectedPlans[plan.id] ? 'Cancel' : 'Choose Plan'}
                                                            </button>
                                                            {selectedPlans[plan.id] && (
                                                                <button 
                                                                    className="odoo-btn"
                                                                    style={{ 
                                                                        flex: 1,
                                                                        border: '2px solid #CC5B4B',
                                                                        backgroundColor: 'transparent',
                                                                        color: '#CC5B4B',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onClick={() => handleProceedToPayment(plan.id)}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#CC5B4B';
                                                                        e.currentTarget.style.color = 'white';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.color = '#CC5B4B';
                                                                    }}
                                                                >
                                                                    Pay
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </Layout>

            {/* Plans Modal */}
            <Modal show={showPlansModal} onHide={handleCloseModal} size="lg" centered>
            <Modal.Header closeButton style={{ borderBottom: '1px solid #e3e6e8' }}>
                <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    Select a Plan - {selectedPackage?.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '2rem' }}>
                {selectedPackage?.plans && selectedPackage.plans.length > 0 ? (
                    <div className="row">
                        {selectedPackage.plans.map((plan) => (
                            <div key={plan.id} className="col-md-6 mb-3">
                                <div style={{
                                    border: '1px solid #e3e6e8',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    backgroundColor: '#fff',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#CC5B4B';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(204, 91, 75, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e3e6e8';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => handleSelectPlan(plan)}>
                                    <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {plan.name}
                                    </h5>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#CC5B4B', marginBottom: '1rem' }}>
                                        TSH {parseFloat(plan.price).toLocaleString()}
                                        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#6c757d' }}>/{plan.duration_days} days</span>
                                    </div>
                                    
                                    {plan.description && (
                                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>
                                            {plan.description}
                                        </p>
                                    )}
                                    
                                    <div style={{ marginBottom: '1rem', flex: 1, textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#222', marginBottom: '0.5rem', textAlign: 'left' }}>
                                            {plan.max_units && (
                                                <div className="mb-2" style={{ textAlign: 'left' }}>
                                                    <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                                                    Up to {plan.max_units} units
                                                </div>
                                            )}
                                            {plan.max_property_managers && (
                                                <div className="mb-2" style={{ textAlign: 'left' }}>
                                                    <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                                                    Up to {plan.max_property_managers} property managers
                                                </div>
                                            )}
                                            {plan.allow_sms_notifications && (
                                                <div className="mb-2" style={{ textAlign: 'left' }}>
                                                    <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginRight: '0.5rem' }}></i>
                                                    SMS Notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className="odoo-btn"
                                        style={{
                                            width: '100%',
                                            border: '2px solid #CC5B4B',
                                            backgroundColor: 'transparent',
                                            color: '#CC5B4B',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectPlan(plan);
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#CC5B4B';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#CC5B4B';
                                        }}
                                    >
                                        Subscribe to {plan.name}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p style={{ color: '#6c757d' }}>No plans available for this package.</p>
                    </div>
                )}
            </Modal.Body>
        </Modal>

        {/* Payment Modal */}
        <Modal 
            show={showPaymentModal} 
            onHide={handleClosePaymentModal}
            backdrop={paymentStatus === 'processing' ? "static" : true}
            keyboard={paymentStatus !== 'processing'}
            centered
            style={{ zIndex: 1070 }}
        >
            <Modal.Header closeButton={paymentStatus !== 'processing'}>
                <Modal.Title>
                    {paymentStatus === 'input' && (
                        <>
                            <i className="bi bi-credit-card text-primary me-2"></i>
                            Payment Details
                        </>
                    )}
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
                {paymentStatus === 'input' && selectedPlanForPayment && (
                    <div>
                        <div className="bg-light p-3 rounded mb-4">
                            <h6 className="mb-3">Subscription Details:</h6>
                            <div className="row mb-2">
                                <div className="col-5 text-muted">Plan:</div>
                                <div className="col-7 fw-bold">{selectedPlanForPayment.name}</div>
                            </div>
                            <div className="row mb-2">
                                <div className="col-5 text-muted">Duration:</div>
                                <div className="col-7">{selectedPlanForPayment.duration_days} days</div>
                            </div>
                            <div className="row">
                                <div className="col-5 text-muted">Amount:</div>
                                <div className="col-7 fw-bold text-success">
                                    TSH {parseFloat(selectedPlanForPayment.price).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Payment Networks Information */}
                        <div className="mb-4">
                            <h6 className="mb-3">Payment Method</h6>
                            <p className="text-muted small mb-2">Available payment networks:</p>
                            <div className="d-flex gap-3 mb-3">
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

                        <div className="mb-3">
                            <label className="form-label">Phone Number</label>
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
                            <div className="form-text">Enter your mobile money number without the country code</div>
                        </div>

                        {subscriptionError && (
                            <div className="alert alert-danger">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {subscriptionError}
                            </div>
                        )}

                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            A payment prompt will be sent to your phone. Please enter your PIN to complete the payment.
                        </div>
                    </div>
                )}

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
                                        TSH {selectedPlanForPayment ? parseFloat(selectedPlanForPayment.price).toLocaleString() : '0'}
                                    </span>
                                </div>
                                <div className="col-6">
                                    <strong className="text-muted d-block mb-1">Phone:</strong>
                                    <span>+255 {phoneNumber}</span>
                                </div>
                            </div>
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
                        
                        {selectedPlanForPayment && (
                            <div className="bg-light p-3 rounded mb-4">
                                <div className="row">
                                    <div className="col-6">
                                        <strong className="d-block text-muted">Plan:</strong>
                                        <span>{selectedPlanForPayment.name}</span>
                                    </div>
                                    <div className="col-6">
                                        <strong className="d-block text-muted">Duration:</strong>
                                        <span>{selectedPlanForPayment.duration_days} days</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="alert alert-success">
                            <i className="bi bi-shield-check me-2"></i>
                            Your account has been upgraded successfully!
                        </div>
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

                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Please check your mobile money balance and try again.
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {paymentStatus === 'input' && (
                    <>
                        <button 
                            className="odoo-btn"
                            style={{
                                border: '2px solid #6c757d',
                                backgroundColor: 'transparent',
                                color: '#6c757d',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={handleClosePaymentModal}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#6c757d';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6c757d';
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="odoo-btn"
                            style={{
                                border: '2px solid #CC5B4B',
                                backgroundColor: 'transparent',
                                color: '#CC5B4B',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={handleSubscribePayment}
                            disabled={!phoneNumber || phoneNumber.length !== 9}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = '#CC5B4B';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#CC5B4B';
                                }
                            }}
                        >
                            Confirm & Pay
                        </button>
                    </>
                )}
                
                {paymentStatus === 'processing' && (
                    <button 
                        className="odoo-btn w-100"
                        style={{
                            border: '2px solid #6c757d',
                            backgroundColor: 'transparent',
                            color: '#6c757d'
                        }}
                        onClick={handleClosePaymentModal}
                    >
                        Cancel Payment
                    </button>
                )}
                
                {paymentStatus === 'success' && (
                    <button 
                        className="odoo-btn w-100"
                        style={{
                            border: '2px solid #28a745',
                            backgroundColor: '#28a745',
                            color: 'white'
                        }}
                        onClick={handlePaymentSuccess}
                    >
                        Continue
                    </button>
                )}

                {paymentStatus === 'failed' && (
                    <button 
                        className="odoo-btn w-100"
                        style={{
                            border: '2px solid #6c757d',
                            backgroundColor: 'transparent',
                            color: '#6c757d'
                        }}
                        onClick={handleClosePaymentModal}
                    >
                        Close
                    </button>
                )}
            </Modal.Footer>
        </Modal>
        </>
    );
}

export default Subscription;
