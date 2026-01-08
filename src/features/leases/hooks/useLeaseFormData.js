/**
 * useLeaseFormData Hook
 * Manages lease form state and calculations
 */

import { useState, useCallback } from 'react';
import { parseFormattedNumber } from '../../../utils/formatUtils';

export const useLeaseFormData = () => {
  const [formData, setFormData] = useState({
    unit: '',
    property_id: '',
    tenant_id: '',
    first_name: '',
    last_name: '',
    tenant_phone: '',
    number_of_month: '',
    start_date: '',
    end_date: '',
    rent_amount_per_unit: '',
    discount: '',
    amount_paid: '',
    total_amount: '',
    payments: []
  });

  // Calculate end date based on start date and number of months
  const calculateEndDate = useCallback((startDate, months) => {
    if (!startDate || !months || months <= 0) return '';

    const start = new Date(startDate);
    const startDay = start.getDate();

    const end = new Date(start);
    end.setMonth(start.getMonth() + parseInt(months));

    if (end.getDate() !== startDay) {
      end.setDate(0);
    }

    end.setDate(end.getDate() - 1);

    return end.toISOString().split('T')[0];
  }, []);

  // Calculate total amount based on monthly rent and lease duration
  const calculateTotalAmount = useCallback((monthlyRent, months) => {
    if (!monthlyRent || !months || monthlyRent <= 0 || months <= 0) return '';
    return (parseFloat(monthlyRent) * parseInt(months)).toString();
  }, []);

  const handleInputChange = useCallback((e, options = {}) => {
    const { name, value } = e.target;
    const { 
      monetaryFields = ['rent_amount_per_unit', 'amount_paid', 'discount'],
      onPropertyChange,
      onTenantChange,
      onUnitChange,
      onClearError
    } = options;

    const rawValue = monetaryFields.includes(name) ? parseFormattedNumber(value) : value;
    
    setFormData(prev => {
      let updates = { [name]: rawValue };

      // Handle property change
      if (name === 'property_id' && value) {
        updates.unit = '';
        updates.rent_amount_per_unit = '';
        if (onPropertyChange) onPropertyChange(value);
      }

      // Handle unit change
      if (name === 'unit' && value && onUnitChange) {
        const unitData = onUnitChange(value);
        if (unitData) {
          updates.rent_amount_per_unit = unitData.rentAmount;
          if (prev.number_of_month) {
            updates.total_amount = calculateTotalAmount(unitData.rentAmount, prev.number_of_month);
          }
        }
      }

      // Handle date/month changes
      if (name === 'start_date' || name === 'number_of_month') {
        const startDate = name === 'start_date' ? value : prev.start_date;
        const months = name === 'number_of_month' ? value : prev.number_of_month;

        if (startDate && months) {
          updates.end_date = calculateEndDate(startDate, months);
          if (prev.rent_amount_per_unit) {
            updates.total_amount = calculateTotalAmount(prev.rent_amount_per_unit, months);
          }
        }
      }

      // Handle rent amount change
      if (name === 'rent_amount_per_unit' && rawValue && prev.number_of_month) {
        updates.total_amount = calculateTotalAmount(rawValue, prev.number_of_month);
      }

      return { ...prev, ...updates };
    });

    if (onClearError) onClearError();
  }, [calculateEndDate, calculateTotalAmount]);

  const updateTenantInfo = useCallback((tenant) => {
    setFormData(prev => ({
      ...prev,
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      tenant_phone: tenant.phone || tenant.username || ''
    }));
  }, []);

  const addPayment = useCallback((payment) => {
    setFormData(prev => ({
      ...prev,
      payments: [...prev.payments, { ...payment, id: Date.now() }]
    }));
  }, []);

  const removePayment = useCallback((paymentId) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== paymentId)
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      unit: '',
      property_id: '',
      tenant_id: '',
      first_name: '',
      last_name: '',
      tenant_phone: '',
      number_of_month: '',
      start_date: '',
      end_date: '',
      rent_amount_per_unit: '',
      discount: '',
      amount_paid: '',
      total_amount: '',
      payments: []
    });
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = [
      'property_id', 'unit', 'tenant_id',
      'start_date', 'number_of_month', 'rent_amount_per_unit'
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        return { valid: false, error: `Please fill in ${field.replace('_', ' ')}` };
      }
    }

    if (formData.number_of_month <= 0) {
      return { valid: false, error: 'Number of months must be greater than 0' };
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate <= startDate) {
      return { valid: false, error: 'End date must be after start date' };
    }

    return { valid: true };
  }, [formData]);

  return {
    formData,
    handleInputChange,
    updateTenantInfo,
    addPayment,
    removePayment,
    resetForm,
    validateForm,
  };
};
