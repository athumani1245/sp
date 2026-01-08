/**
 * usePaymentManagement Hook
 * Manages payment form and payment list
 */

import { useState, useCallback } from 'react';
import { parseFormattedNumber } from '../../../utils/formatUtils';

export const usePaymentManagement = () => {
  const [currentPayment, setCurrentPayment] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    category: '',
    payment_source: '',
    amount_paid: ''
  });
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const handlePaymentChange = useCallback((name, value) => {
    const rawValue = name === 'amount_paid' ? parseFormattedNumber(value) : value;
    setCurrentPayment(prev => ({ ...prev, [name]: rawValue }));
  }, []);

  const validatePayment = useCallback(() => {
    const { payment_date, category, payment_source, amount_paid } = currentPayment;

    if (!payment_date || !category || !payment_source || !amount_paid) {
      return { valid: false, error: 'Please fill in all payment fields' };
    }

    const amount = parseFloat(amount_paid);
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Please enter a valid payment amount' };
    }

    return { valid: true };
  }, [currentPayment]);

  const resetPaymentForm = useCallback(() => {
    setCurrentPayment({
      payment_date: new Date().toISOString().split('T')[0],
      category: '',
      payment_source: '',
      amount_paid: ''
    });
  }, []);

  const startAddingPayment = useCallback(() => {
    setIsAddingPayment(true);
  }, []);

  const cancelPayment = useCallback(() => {
    resetPaymentForm();
    setIsAddingPayment(false);
  }, [resetPaymentForm]);

  const resetAll = useCallback(() => {
    resetPaymentForm();
    setIsAddingPayment(false);
  }, [resetPaymentForm]);

  return {
    currentPayment,
    isAddingPayment,
    handlePaymentChange,
    validatePayment,
    resetPaymentForm,
    startAddingPayment,
    cancelPayment,
    resetAll,
  };
};
