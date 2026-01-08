/**
 * usePaymentFlow Hook
 * Manages payment modal and mobile money payment flow
 */

import { useState } from 'react';
import {
  createSubscription,
  startPaymentStatusListener,
  stopPaymentStatusListener
} from '../../../services/licenseService';

export const usePaymentFlow = (onPaymentSuccess) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [subscriptionError, setSubscriptionError] = useState('');
  const [apiResponseDescription, setApiResponseDescription] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [paymentListener, setPaymentListener] = useState(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  const handleProceedToPayment = (selectedPlan) => {
    setSelectedPlanForPayment(selectedPlan);
    setShowPaymentModal(true);
    setPaymentStatus('input');
    setPhoneNumber('');
    setSubscriptionError('');
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
                    handlePaymentSuccessInternal();
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
                onTimeout: () => {
                  setPaymentStatus('failed');
                  setSubscriptionError('Payment verification timed out. Please check your mobile money account.');
                  setSubscribing(false);
                },
                onError: () => {
                  // Silent error handling
                }
              }
            );

            setPaymentListener(listener);
          }
        } else {
          setPaymentStatus('success');
          setSubscribing(false);

          setTimeout(() => {
            handlePaymentSuccessInternal();
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

  const handlePaymentSuccessInternal = () => {
    setShowPaymentModal(false);
    setPaymentStatus('pending');
    setPhoneNumber('');
    setSubscriptionError('');
    setApiResponseDescription('');
    setCurrentTransactionId(null);
    setPaymentListener(null);
    setSelectedPlanForPayment(null);

    if (onPaymentSuccess) {
      onPaymentSuccess();
    }

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

  return {
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
  };
};
