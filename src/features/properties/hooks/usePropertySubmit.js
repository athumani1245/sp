import { useState } from 'react';
import { addProperty } from '../../../services/propertyService';

export const usePropertySubmit = (formData, resetForm, resetLocationData, onPropertyAdded, onClose) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await addProperty(formData);
            if (result.success) {
                setSuccess(result.message || 'Property added successfully!');
                resetForm();
                resetLocationData();
                
                if (onPropertyAdded) {
                    onPropertyAdded(result.data);
                }
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to add property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        setError,
        setSuccess,
        handleSubmit
    };
};
