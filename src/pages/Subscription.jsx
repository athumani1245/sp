/**
 * Subscription Page - Refactored
 * Manages subscription plans and payment flow
 */

import React from 'react';
import Layout from '../components/Layout';
import CurrentPlanCard from '../features/subscription/components/CurrentPlanCard';
import BillingHistoryCard from '../features/subscription/components/BillingHistoryCard';
import PlanSelectionModal from '../features/subscription/components/PlanSelectionModal';
import PaymentModal from '../features/subscription/components/PaymentModal';
import { useSubscription } from '../hooks/useSubscription';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSubscriptionData } from '../features/subscription/hooks/useSubscriptionData';
import { useSubscriptionPlans } from '../features/subscription/hooks/useSubscriptionPlans';
import { usePaymentFlow } from '../features/subscription/hooks/usePaymentFlow';
import '../assets/styles/profile.css';

function Subscription() {
  usePageTitle('Subscription');
  const { subscription, hasActiveSubscription } = useSubscription();

  const { detailedSubscription, billingHistory, loading, refreshSubscription } = useSubscriptionData();

  const {
    showUpgradePlans,
    plans,
    plansLoading,
    showPlansModal,
    selectedPackage,
    selectedPlans,
    plansRef,
    setShowUpgradePlans,
    handleUpgradeClick,
    handleSelectPackage,
    handleCloseModal,
    handleSelectPlan,
    handleCancelPlanSelection,
  } = useSubscriptionPlans();

  const {
    showPaymentModal,
    phoneNumber,
    paymentStatus,
    subscriptionError,
    apiResponseDescription,
    selectedPlanForPayment,
    subscribing,
    setPhoneNumber,
    handleProceedToPayment,
    handleSubscribePayment,
    handleClosePaymentModal,
    handlePaymentSuccess: handlePaymentSuccessInternal,
  } = usePaymentFlow(() => {
    refreshSubscription();
    setShowUpgradePlans(false);
  });

  const handleProceedToPaymentWrapper = (packageId) => {
    const selectedPlan = selectedPlans[packageId];
    handleProceedToPayment(selectedPlan);
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
              <div className="col-12">
                {/* Plan Section */}
                <div className="mb-4">
                  <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Plan</h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <CurrentPlanCard
                        subscription={detailedSubscription}
                        hasActiveSubscription={detailedSubscription?.is_active || hasActiveSubscription}
                        onUpgradeClick={handleUpgradeClick}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <BillingHistoryCard billingHistory={billingHistory} />
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
                            <div
                              style={{
                                border: selectedPlans[plan.id] ? '2px solid #28a745' : '1px solid #e3e6e8',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                backgroundColor: '#fff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                              }}
                            >
                              {selectedPlans[plan.id] && (
                                <div
                                  style={{
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
                                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
                                  }}
                                >
                                  <i
                                    className="bi bi-check-lg"
                                    style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}
                                  ></i>
                                </div>
                              )}

                              <h5 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {plan.name}
                              </h5>

                              {selectedPlans[plan.id] && (
                                <div
                                  style={{
                                    backgroundColor: '#d4edda',
                                    border: '1px solid #c3e6cb',
                                    borderRadius: '6px',
                                    padding: '0.5rem',
                                    marginBottom: '1rem',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#155724',
                                      fontWeight: 600,
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    Selected Plan:
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#155724', fontWeight: 700 }}>
                                    {selectedPlans[plan.id].name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#155724' }}>
                                    TSH {parseFloat(selectedPlans[plan.id].price).toLocaleString()} /{' '}
                                    {selectedPlans[plan.id].duration_days} days
                                  </div>
                                </div>
                              )}

                              <div style={{ marginBottom: '1.5rem', flex: 1, textAlign: 'left' }}>
                                <p
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: '#222',
                                    marginBottom: '0.75rem',
                                    textAlign: 'left',
                                  }}
                                >
                                  Features:
                                </p>
                                <ul
                                  style={{
                                    paddingLeft: '1.25rem',
                                    marginBottom: 0,
                                    textAlign: 'left',
                                    listStylePosition: 'outside',
                                  }}
                                >
                                  {plan.features.map((feature, index) => (
                                    <li
                                      key={index}
                                      style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}
                                    >
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
                                    transition: 'all 0.3s ease',
                                  }}
                                  onClick={() =>
                                    selectedPlans[plan.id]
                                      ? handleCancelPlanSelection(plan.id)
                                      : handleSelectPackage(plan)
                                  }
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
                                      transition: 'all 0.3s ease',
                                    }}
                                    onClick={() => handleProceedToPaymentWrapper(plan.id)}
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

      <PlanSelectionModal
        show={showPlansModal}
        onHide={handleCloseModal}
        selectedPackage={selectedPackage}
        onSelectPlan={handleSelectPlan}
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        paymentStatus={paymentStatus}
        phoneNumber={phoneNumber}
        selectedPlan={selectedPlanForPayment}
        subscriptionError={subscriptionError}
        apiResponseDescription={apiResponseDescription}
        subscribing={subscribing}
        onPhoneNumberChange={setPhoneNumber}
        onSubmitPayment={handleSubscribePayment}
        onPaymentSuccess={handlePaymentSuccessInternal}
      />
    </>
  );
}

export default Subscription;
