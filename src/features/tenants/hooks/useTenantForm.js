import { useState, useEffect } from 'react';

export const useTenantForm = (isOpen) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: ''
    });
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            username: ''
        });
        setPhoneNumber('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
        setFormData(prev => ({
            ...prev,
            username: value || ''
        }));
    };

    const validateForm = () => {
        const requiredFields = ['first_name', 'last_name', 'username'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                return `Please fill in ${field.replace('_', ' ')}`;
            }
        }
        if (!phoneNumber || phoneNumber.length < 10) {
            return 'Please enter a valid phone number';
        }
        return null;
    };

    return {
        formData,
        phoneNumber,
        handleInputChange,
        handlePhoneChange,
        validateForm,
        resetForm
    };
};
