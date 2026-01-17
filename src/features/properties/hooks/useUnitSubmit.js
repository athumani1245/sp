import { useState } from 'react';
import { addPropertyUnit } from '../../../services/propertyService';

export const useUnitSubmit = (propertyId, formatFormData, resetForm, onUnitAdded, onClose) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const unitData = formatFormData();
            const result = await addPropertyUnit(propertyId, unitData);
            
            if (result.success) {
                setSuccess(result.message || 'Unit added successfully!');
                resetForm();
                
                if (onUnitAdded) {
                    onUnitAdded(result.data);
                }
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to add unit. Please try again.');
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
