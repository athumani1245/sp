import { useState } from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '../../../utils/formatUtils';

export const useUnitForm = () => {
    const [formData, setFormData] = useState({
        unitNumber: '',
        floor: '',
        unitType: 'Standard',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        rentAmount: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        if (name === 'rentAmount') {
            const rawValue = parseFormattedNumber(value);
            setFormData(prev => ({
                ...prev,
                [name]: rawValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            unitNumber: '',
            floor: '',
            unitType: 'Standard',
            bedrooms: '',
            bathrooms: '',
            squareFootage: '',
            rentAmount: '',
            description: ''
        });
    };

    const formatFormData = () => ({
        unit_number: formData.unitNumber,
        floor: formData.floor ? Number(formData.floor) : null,
        unit_type: formData.unitType,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        square_footage: formData.squareFootage ? Number(formData.squareFootage) : null,
        rent_amount: formData.rentAmount ? Number(formData.rentAmount) : null,
        description: formData.description || null,
        status: 'available'
    });

    return {
        formData,
        handleInputChange,
        resetForm,
        formatFormData,
        formatNumberWithCommas
    };
};
