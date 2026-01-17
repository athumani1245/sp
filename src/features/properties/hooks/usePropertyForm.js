import { useState } from 'react';

export const usePropertyForm = () => {
    const [formData, setFormData] = useState({
        propertyName: '',
        propertyType: 'Apartment',
        region: '',
        district: '',
        ward: '',
        street: '',
        manager_id: ''
    });

    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            propertyName: '',
            propertyType: 'Apartment',
            region: '',
            district: '',
            ward: '',
            street: '',
            manager_id: ''
        });
        setSelectedRegionId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
    };

    return {
        formData,
        setFormData,
        selectedRegionId,
        setSelectedRegionId,
        selectedDistrictId,
        setSelectedDistrictId,
        selectedWardId,
        setSelectedWardId,
        handleInputChange,
        resetForm
    };
};
