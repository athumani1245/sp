import { useState } from 'react';
import { createTenant } from '../../../services/tenantService';

export const useTenantSubmit = (formData, onTenantAdded, onClose) => {
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
            const tenantData = {
                username: formData.username,
                password: 'StrongPass123',
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: "Tenant"
            };
            
            const result = await createTenant(tenantData);
            if (result.success) {
                setSuccess(result.message || 'Tenant created successfully!');
                if (onTenantAdded) {
                    onTenantAdded({ id: result.data?.id || Date.now(), ...tenantData });
                }
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(typeof result.error === 'string' ? result.error : 'Failed to create tenant. Please try again.');
            }
        } catch (error) {
            setError(error.message || 'Failed to create tenant. Please try again.');
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
