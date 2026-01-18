/**
 * useLeaseSubmit Hook
 * Handles lease creation submission
 */

import { useState, useCallback } from 'react';
import { createLease } from '../../../services/leaseService';

export const useLeaseSubmit = (formData, tenants, validateForm, onSuccess) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDatePayment = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      const selectedTenant = tenants.find(
        tenant => tenant.id === parseInt(formData.tenant_id) || tenant.id === formData.tenant_id
      );

      if (!selectedTenant) {
        setError('Selected tenant information not found');
        setSubmitLoading(false);
        return;
      }

      const leaseData = {
        unit: formData.unit,
        first_name: selectedTenant.first_name,
        last_name: selectedTenant.last_name,
        tenant_phone: selectedTenant.phone || selectedTenant.username || '',
        number_of_month: formData.number_of_month,
        start_date: formData.start_date,
        end_date: formData.end_date,
        rent_amount_per_unit: formData.rent_amount_per_unit,
        discount: formData.discount || '0',
        amount_paid: formData.amount_paid || '0',
        total_amount: formData.total_amount,
        payments: formData.payments.map(payment => ({
          payment_date: formatDatePayment(payment.payment_date),
          category: payment.category,
          payment_source: payment.payment_source,
          amount_paid: payment.amount_paid
        }))
      };

      const result = await createLease(leaseData);

      if (result.success) {
        setSuccess(result.message || 'Lease created successfully!');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : 'Failed to create lease. Please try again.';
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create lease. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  }, [formData, tenants, validateForm, formatDatePayment, onSuccess]);

  return {
    submitLoading,
    error,
    success,
    setError,
    setSuccess,
    handleSubmit,
  };
};
