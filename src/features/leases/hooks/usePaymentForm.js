import { useState, useEffect } from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '../../../utils/formatUtils';

export const usePaymentForm = (isOpen) => {
    const [formData, setFormData] = useState({
        amount_paid: '',
        date_paid: new Date().toISOString().slice(0, 10),
        category: 'RENT',
        payment_source: 'CASH'
    });

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            amount_paid: '',
            date_paid: new Date().toISOString().slice(0, 10),
            category: 'RENT',
            payment_source: 'CASH'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'amount_paid') {
            const rawValue = parseFormattedNumber(value);
            setFormData(prev => ({
                ...prev,
                [name]: rawValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        if (!formData.amount_paid) {
            return 'Please enter the payment amount';
        }
        if (!formData.date_paid) {
            return 'Please select the payment date';
        }
        if (parseFloat(formData.amount_paid) <= 0) {
            return 'Payment amount must be greater than 0';
        }
        return null;
    };

    return {
        formData,
        handleInputChange,
        validateForm,
        resetForm,
        formatNumberWithCommas
    };
};
