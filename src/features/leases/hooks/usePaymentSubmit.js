import { useState } from 'react';
import { createPayment } from '../../../services/paymentService';

export const usePaymentSubmit = (formData, leaseId, onPaymentAdded, onClose) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e, validateForm) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitLoading(true);
        setError('');
        
        try {
            const paymentData = {
                ...formData,
                lease: leaseId
            };

            const response = await createPayment(paymentData);

            if (response.success) {
                setSuccess('Payment added successfully!');
                if (onPaymentAdded) {
                    onPaymentAdded(response.data);
                }
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(response.error || 'Failed to add payment');
            }
        } catch (err) {
            setError('An error occurred while adding the payment');
        } finally {
            setSubmitLoading(false);
        }
    };

    return {
        submitLoading,
        error,
        success,
        setError,
        setSuccess,
        handleSubmit
    };
};
