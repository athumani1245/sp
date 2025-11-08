import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { getProperties, getAvailableUnits } from '../../services/propertyService';
import { createLease } from '../../services/leaseService';
import { getTenants } from '../../services/tenantService';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/formatUtils';
import '../../assets/styles/add-lease.css';
import '../../assets/styles/forms-responsive.css';

// Custom styles for underlined inputs
const UNDERLINE_INPUT_STYLES = {
    border: 'none',
    borderBottom: '2px solid #dee2e6',
    borderRadius: '0',
    backgroundColor: 'transparent',
    padding: '8px 0',
    fontSize: '0.95rem',
    transition: 'border-bottom-color 0.3s ease',
    boxShadow: 'none'
};

const UNDERLINE_FOCUS_STYLES = {
    border: 'none',
    borderBottom: '2px solid #CC5B4B',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    outline: 'none'
};

const READONLY_INPUT_STYLES = {
    ...UNDERLINE_INPUT_STYLES,
    backgroundColor: 'transparent',
    cursor: 'not-allowed',
    color: '#6c757d',
    borderBottomColor: '#e9ecef'
};

// Payment categories and sources
const PAYMENT_CATEGORIES = [
    { value: 'RENT', label: 'Rent' },
    { value: 'Security Deposit', label: 'Security Deposit' },
    { value: 'WATER', label: 'Water' },
    { value: 'SERVICE_CHARGE', label: 'Service Charge' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'OTHER', label: 'Other' }
];

const PAYMENT_SOURCES = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK', label: 'Bank' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' }
];

// Common button styling for payment table actions
const ACTION_BUTTON_STYLE = { 
    fontSize: '0.8rem', 
    padding: '0.2rem 0.4rem',
    minWidth: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const TABLE_CELL_STYLE = {
    fontSize: '0.8rem',
    border: 'none',
    backgroundColor: 'transparent'
};

// SearchableSelect Component
const SearchableSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    disabled, 
    name,
    getOptionLabel,
    getOptionValue,
    noOptionsMessage = "No options available"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setFilteredOptions(options);
    }, [options]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option => 
                getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, getOptionLabel]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setSearchTerm('');
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen, closeDropdown]);

    const handleInputClick = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    }, [disabled, isOpen]);

    const handleOptionSelect = useCallback((option) => {
        onChange({ target: { name, value: getOptionValue(option) } });
        closeDropdown();
    }, [name, onChange, getOptionValue, closeDropdown]);

    const getDisplayValue = () => {
        if (!value) return '';
        const selectedOption = options.find(option => getOptionValue(option) === value);
        return selectedOption ? getOptionLabel(selectedOption) : '';
    };

    return (
        <div className="searchable-select position-relative" ref={dropdownRef}>
            <div 
                className={`d-flex align-items-center justify-content-between ${disabled ? 'disabled' : ''}`}
                onClick={handleInputClick}
                onKeyDown={(e) => {
                    // Prevent Bootstrap dropdown handlers
                    if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                        setSearchTerm('');
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!disabled) {
                            setIsOpen(!isOpen);
                        }
                    }
                }}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                style={{ 
                    ...UNDERLINE_INPUT_STYLES,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: 'transparent',
                    minHeight: '38px',
                    borderBottomColor: disabled ? '#e9ecef' : (isOpen ? '#CC5B4B' : '#dee2e6')
                }}
            >
                <span className={!value ? 'text-muted' : ''}>
                    {!value ? placeholder : getDisplayValue()}
                </span>
                {/* <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i> */}
            </div>
            
            {isOpen && (
                <div 
                    className="dropdown-menu show w-100 position-absolute"
                    role="listbox"
                    aria-label="Options"
                    style={{ 
                        zIndex: 1050, 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        top: '100%',
                        left: 0
                    }}
                    onKeyDown={(e) => {
                        // Prevent Bootstrap interference at dropdown level
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(false);
                            setSearchTerm('');
                        }
                    }}
                >
                    <div className="p-2 border-bottom">
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                // Prevent Bootstrap dropdown handlers from interfering
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }
                            }}
                        />
                    </div>
                    
                    <div className="dropdown-items">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={getOptionValue(option)}
                                    className={`dropdown-item ${getOptionValue(option) === value ? 'active' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {getOptionLabel(option)}
                                </div>
                            ))
                        ) : (
                            <div className="dropdown-item-text text-muted">
                                {noOptionsMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};





const AddLeaseModal = ({ isOpen, onClose, onLeaseAdded }) => {
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

    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [currentPayment, setCurrentPayment] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        category: '',
        payment_source: '',
        amount_paid: ''
    });
    const [isAddingPayment, setIsAddingPayment] = useState(false);

    // Helper function to format date for payment submission
    const formatDatePayment = useCallback((dateString) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString;
        }
    }, []);

    // Generic data loading function to reduce duplication
    const loadData = useCallback(async (fetchFunction, setDataFunction, errorMessage) => {
        try {
            setLoading(true);
            const result = await fetchFunction();
            if (result.success) {
                setDataFunction(result.data || []);
            } else {
                setError(errorMessage);
            }
        } catch (error) {
            console.error(errorMessage, error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTenants = useCallback(() => {
        return loadData(getTenants, setTenants, 'Failed to load tenants');
    }, [loadData]);

    const loadProperties = useCallback(() => {
        return loadData(getProperties, setProperties, 'Failed to load properties');
    }, [loadData]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm();
            loadProperties();
            loadTenants();
        }
    }, [isOpen, loadProperties, loadTenants]);

    const resetForm = () => {
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
        setCurrentPayment({
            payment_date: new Date().toISOString().split('T')[0],
            category: '',
            payment_source: '',
            amount_paid: ''
        });
        setIsAddingPayment(false);
        setAvailableUnits([]);
        setError('');
        setSuccess('');
    };

    // Load available units for a property
    const loadAvailableUnits = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            const result = await getAvailableUnits({ property: propertyId });
            
            if (result.success) {
                setAvailableUnits(result.data);
            } else {
                setError(result.error || 'Failed to load available units');
                setAvailableUnits([]);
            }
        } catch (error) {
            console.error('Failed to load units:', error);
            setError('Failed to load available units');
            setAvailableUnits([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Calculate end date based on start date and number of months
    const calculateEndDate = useCallback((startDate, months) => {
        if (!startDate || !months || months <= 0) return '';
        
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(start.getMonth() + parseInt(months));
        
        return end.toISOString().split('T')[0];
    }, []);

    // Calculate total amount based on monthly rent and lease duration
    const calculateTotalAmount = useCallback((monthlyRent, months) => {
        if (!monthlyRent || !months || monthlyRent <= 0 || months <= 0) return '';
        
        return (parseFloat(monthlyRent) * parseInt(months)).toString();
    }, []);

    // Helper functions for handling specific field changes
    const handlePropertyChange = useCallback((value) => {
        loadAvailableUnits(value);
        setFormData(prev => ({ ...prev, unit: '', rent_amount_per_unit: '' }));
    }, [loadAvailableUnits]);

    const handleTenantChange = useCallback((value) => {
        const selectedTenant = tenants.find(tenant => 
            tenant.id === parseInt(value) || tenant.id === value
        );
        
        if (selectedTenant) {
            setFormData(prev => ({
                ...prev,
                first_name: selectedTenant.first_name,
                last_name: selectedTenant.last_name,
                tenant_phone: selectedTenant.phone || selectedTenant.username || ''
            }));
        }
    }, [tenants]);

    const handleUnitChange = useCallback((value) => {
        const selectedUnit = availableUnits.find(unit => unit.id.toString() === value);
        if (selectedUnit) {
            const rentAmount = selectedUnit.rent_per_month || selectedUnit.rent_amount || 0;
            setFormData(prev => ({ 
                ...prev, 
                rent_amount_per_unit: rentAmount,
                total_amount: prev.number_of_month ? calculateTotalAmount(rentAmount, prev.number_of_month) : ''
            }));
        }
    }, [availableUnits, calculateTotalAmount]);

    const handleDateOrMonthChange = useCallback((name, value) => {
        setFormData(prev => {
            const startDate = name === 'start_date' ? value : prev.start_date;
            const months = name === 'number_of_month' ? value : prev.number_of_month;
            
            if (startDate && months) {
                const endDate = calculateEndDate(startDate, months);
                const totalAmount = prev.rent_amount_per_unit 
                    ? calculateTotalAmount(prev.rent_amount_per_unit, months) 
                    : '';
                
                return { ...prev, end_date: endDate, total_amount: totalAmount };
            }
            return prev;
        });
    }, [calculateEndDate, calculateTotalAmount]);

    const handleRentAmountChange = useCallback((rawValue) => {
        setFormData(prev => {
            if (rawValue && prev.number_of_month) {
                const totalAmount = calculateTotalAmount(rawValue, prev.number_of_month);
                return { ...prev, total_amount: totalAmount };
            }
            return prev;
        });
    }, [calculateTotalAmount]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const monetaryFields = ['rent_amount_per_unit', 'amount_paid', 'discount'];
        
        // Update form data
        const rawValue = monetaryFields.includes(name) ? parseFormattedNumber(value) : value;
        setFormData(prev => ({ ...prev, [name]: rawValue }));
        
        // Clear errors
        setError('');
        setSuccess('');

        // Handle specific field changes
        if (name === 'property_id' && value) handlePropertyChange(value);
        if (name === 'tenant_id' && value) handleTenantChange(value);
        if (name === 'unit' && value) handleUnitChange(value);
        if (name === 'start_date' || name === 'number_of_month') handleDateOrMonthChange(name, value);
        if (name === 'rent_amount_per_unit') handleRentAmountChange(rawValue);
    }, [handlePropertyChange, handleTenantChange, handleUnitChange, handleDateOrMonthChange, handleRentAmountChange]);

    const validateForm = () => {
        
        const requiredFields = [
            'property_id', 'unit', 'tenant_id', 
            'start_date', 'number_of_month', 'rent_amount_per_unit'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }

        // Validate number of months
        if (formData.number_of_month <= 0) {
            setError('Number of months must be greater than 0');
            return false;
        }

        // Validate dates (end_date should be automatically calculated)
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        if (endDate <= startDate) {
            setError('End date must be after start date');
            return false;
        }

        return true;
    };

    // Payment management functions
    const handlePaymentChange = useCallback((name, value) => {
        const rawValue = name === 'amount_paid' ? parseFormattedNumber(value) : value;
        setCurrentPayment(prev => ({ ...prev, [name]: rawValue }));
    }, []);

    const validatePayment = useCallback(() => {
        const { payment_date, category, payment_source, amount_paid } = currentPayment;
        
        if (!payment_date || !category || !payment_source || !amount_paid) {
            setError('Please fill in all payment fields');
            return false;
        }

        const amount = parseFloat(amount_paid);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid payment amount');
            return false;
        }

        return true;
    }, [currentPayment]);

    const resetPaymentForm = useCallback(() => {
        setCurrentPayment({
            payment_date: new Date().toISOString().split('T')[0],
            category: '',
            payment_source: '',
            amount_paid: ''
        });
    }, []);

    const addPayment = useCallback(() => {
        if (!validatePayment()) return;

        const newPayment = {
            ...currentPayment,
            amount_paid: parseFloat(currentPayment.amount_paid),
            id: Date.now()
        };

        setFormData(prev => ({
            ...prev,
            payments: [...prev.payments, newPayment]
        }));

        resetPaymentForm();
        setError('');
    }, [currentPayment, validatePayment, resetPaymentForm]);

    const removePayment = useCallback((paymentId) => {
        setFormData(prev => ({
            ...prev,
            payments: prev.payments.filter(payment => payment.id !== paymentId)
        }));
    }, []);

    const cancelPayment = useCallback(() => {
        resetPaymentForm();
        setIsAddingPayment(false);
    }, [resetPaymentForm]);

    const startAddingPayment = useCallback(() => {
        setIsAddingPayment(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSubmitLoading(true);
        setError('');
        
        try {
            // Find selected tenant again to ensure we have the latest data
            const selectedTenant = tenants.find(tenant => tenant.id === parseInt(formData.tenant_id) || tenant.id === formData.tenant_id);
            
            if (!selectedTenant) {
                setError('Selected tenant information not found');
                return;
            }

            // Prepare data for API call - use tenant information from selected tenant
            const leaseData = {
                unit: formData.unit,
                first_name: selectedTenant.first_name,
                last_name: selectedTenant.last_name,
                tenant_phone: selectedTenant.phone || selectedTenant.username || '',
                number_of_month: formData.number_of_month,
                start_date: formData.start_date,
                end_date: formData.end_date,
                rent_amount_per_unit: formData.rent_amount_per_unit,
                discount: formData.discount || "0",
                amount_paid: formData.amount_paid || "0",
                total_amount: formData.total_amount,
                payments: formData.payments.map(payment => ({
                    payment_date: formatDatePayment(payment.payment_date),
                    category: payment.category,
                    payment_source: payment.payment_source,
                    amount_paid: payment.amount_paid
                }))
            };

            // Call the actual lease service
            const result = await createLease(leaseData);

            if (result.success) {
                setSuccess(result.message || 'Lease created successfully!');
                // Notify parent to refresh lease list
                if (onLeaseAdded) {
                    onLeaseAdded();
                }
                // Close modal after short delay to show success message
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // Ensure error is a string
                const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create lease. Please try again.';
                setError(errorMessage);
            }

        } catch (error) {
            console.error('Failed to create lease:', error);
            // Ensure error message is a string
            const errorMessage = error.message || 'Failed to create lease. Please try again.';
            setError(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal 
            show={isOpen} 
            onHide={onClose} 
            backdrop="static"
            keyboard={false}
            centered
            className="responsive-modal"
            dialogClassName="modal-95w"
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="text-center w-100 h5 fw-bold text-dark">
                    <i className="bi bi-file-earmark-plus me-2 text-danger"></i>
                    New Lease Agreement
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" className="alert alert-danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success" className="alert alert-success">
                            <i className="bi bi-check-circle me-2"></i>
                            {success}
                        </Alert>
                    )}

                    {/* Two-column layout */}
                    <Row className="g-4">
                        {/* Left Column - Tenant & Property Selection */}
                        <Col lg={6}>
                            <div className="form-section-header mb-3">
                                <i className="fas fa-user text-danger"></i>
                                Property and Tenant Selection
                            </div>
                            
                            <Row className="mb-3">
                                <Col xs={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Tenant *</Form.Label>
                                        <SearchableSelect
                                            options={tenants}
                                            value={formData.tenant_id}
                                            onChange={handleInputChange}
                                            placeholder="Select Tenant"
                                            disabled={loading}
                                            name="tenant_id"
                                            getOptionLabel={(tenant) => `${tenant.first_name} ${tenant.last_name} - ${tenant.username || tenant.phone}`}
                                            getOptionValue={(tenant) => tenant.id}
                                            noOptionsMessage="No tenants available. Please add a tenant first."
                                        />
                                        {tenants.length === 0 && (
                                            <Form.Text className="form-text text-warning">
                                                <i className="bi bi-info-circle me-1"></i>
                                                No tenants available. Please add a tenant first.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                           
                            
                            {/* Property and Unit in one row */}
                            <Row className="mb-3">
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Property *</Form.Label>
                                        <SearchableSelect
                                            options={properties}
                                            value={formData.property_id}
                                            onChange={handleInputChange}
                                            placeholder="Select Property"
                                            disabled={loading}
                                            name="property_id"
                                            getOptionLabel={(property) => property.property_name}
                                            getOptionValue={(property) => property.id}
                                            noOptionsMessage="No properties available"
                                        />
                                    </Form.Group>
                                </Col>
                                
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Available Unit *</Form.Label>
                                        <SearchableSelect
                                            options={availableUnits}
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            placeholder="Select Unit"
                                            disabled={!formData.property_id || loading}
                                            name="unit"
                                            getOptionLabel={(unit) => `${unit.unit_name || unit.unit_number} - TSh ${(unit.rent_per_month || unit.rent_amount || 0).toLocaleString()}/month`}
                                            getOptionValue={(unit) => unit.id}
                                            noOptionsMessage={!formData.property_id ? "Please select a property first" : "No available units"}
                                        />
                                        {loading && formData.property_id && (
                                            <Form.Text className="form-text small">
                                                <i className="spinner-border spinner-border-sm me-1"></i>
                                                Loading units...
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                          
                            {/* Payments Section */}
                            <div className="mt-4">
                                <div className="form-section-header mb-3">
                                    <i className="fas fa-credit-card text-success"></i>
                                    Payment Information
                                </div>

                                {/* Payments Table */}
                                <div className="p-2">
                                    <div className="mb-2">
                                        <h6 className="text-success mb-0">
                                            <i className="bi bi-table me-2"></i>
                                            Payments ({formData.payments.length})
                                        </h6>
                                    </div>
                                    
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered align-middle mb-2">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '20%', fontSize: '0.8rem' }}>Date</th>
                                                    <th style={{ width: '20%', fontSize: '0.8rem' }}>Category</th>
                                                    <th style={{ width: '20%', fontSize: '0.8rem' }}>Source</th>
                                                    <th style={{ width: '30%', fontSize: '0.8rem' }}>Amount (TSh)</th>
                                                    <th style={{ width: '10%', fontSize: '0.8rem' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* New Payment Row - Only show when adding */}
                                                {isAddingPayment && (
                                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                        <td>
                                                            <Form.Control
                                                                type="date"
                                                                size="sm"
                                                                value={currentPayment.payment_date}
                                                                onChange={(e) => handlePaymentChange('payment_date', e.target.value)}
                                                                style={TABLE_CELL_STYLE}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={currentPayment.category}
                                                                onChange={(e) => handlePaymentChange('category', e.target.value)}
                                                                style={TABLE_CELL_STYLE}
                                                            >
                                                                <option value="">Category</option>
                                                                {PAYMENT_CATEGORIES.map(cat => (
                                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={currentPayment.payment_source}
                                                                onChange={(e) => handlePaymentChange('payment_source', e.target.value)}
                                                                style={TABLE_CELL_STYLE}
                                                            >
                                                                <option value="">Method</option>
                                                                {PAYMENT_SOURCES.map(source => (
                                                                    <option key={source.value} value={source.value}>{source.label}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                size="sm"
                                                                placeholder="0"
                                                                value={formatNumberWithCommas(currentPayment.amount_paid)}
                                                                onChange={(e) => handlePaymentChange('amount_paid', e.target.value)}
                                                                style={TABLE_CELL_STYLE}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="d-flex justify-content-center gap-1">
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={addPayment}
                                                                    disabled={!currentPayment.payment_date || !currentPayment.category || !currentPayment.payment_source || !currentPayment.amount_paid}
                                                                    className="btn-sm rounded-circle"
                                                                    style={ACTION_BUTTON_STYLE}
                                                                >
                                                                    <i className="bi bi-check-lg"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={cancelPayment}
                                                                    className="btn-sm rounded-circle"
                                                                    style={ACTION_BUTTON_STYLE}
                                                                >
                                                                    <i className="bi bi-x-lg"></i>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                
                                                {/* Existing Payments */}
                                                {formData.payments.map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td style={{ fontSize: '0.8rem' }}>
                                                            {new Date(payment.payment_date).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem' }}>
                                                            <span className="badge bg-primary">{payment.category}</span>
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem' }}>
                                                            <span className="badge bg-info">{payment.payment_source}</span>
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem' }}>
                                                            <strong>TSh {payment.amount_paid.toLocaleString()}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <Button
                                                                className="btn-sm rounded-circle"
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removePayment(payment.id)}
                                                                style={ACTION_BUTTON_STYLE}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                
                                                {/* Empty state when no payments */}
                                                {formData.payments.length === 0 && !isAddingPayment && (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted" style={{ fontSize: '0.8rem', padding: '1rem' }}>
                                                            <i className="bi bi-info-circle me-2"></i>
                                                            No payments added yet. Click "Add New Line" below to add payments.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Add New Line Button */}
                                    {!isAddingPayment && (
                                        <div className="text-center mt-2 mb-2">
                                            <button
                                                type="button"
                                                onClick={startAddingPayment}
                                                className="odoo-btn odoo-btn-primary"
                                                style={{fontSize: '0.8rem'}}
                                            >
                                                <i className="bi bi-plus-lg me-1"></i>
                                                Add Payment
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Total Summary */}
                                    {formData.payments.length > 0 ? (
                                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                            <small className="text-muted">
                                                {formData.payments.length} payment{formData.payments.length !== 1 ? 's' : ''} added
                                            </small>
                                            <strong className="text-success">
                                                Total: TSh {formData.payments.reduce((sum, payment) => sum + payment.amount_paid, 0).toLocaleString()}
                                            </strong>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </Col>

                        {/* Right Column - Lease Terms & Financial Information */}
                        <Col lg={6}>
                            <div className="form-section-header mb-3">
                                <i className="fas fa-calendar-alt text-danger"></i>
                                Lease Terms
                            </div>
                            
                            {/* Date fields in one row */}
                            <Row className="mb-3">
                                <Col xs={12} sm={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Start Date *</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            required
                                            style={UNDERLINE_INPUT_STYLES}
                                            onFocus={(e) => Object.assign(e.target.style, UNDERLINE_FOCUS_STYLES)}
                                            onBlur={(e) => Object.assign(e.target.style, UNDERLINE_INPUT_STYLES)}
                                        />
                                    </Form.Group>
                                </Col>
                                
                                <Col xs={12} sm={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Duration (Months) *</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="number"
                                            name="number_of_month"
                                            value={formData.number_of_month}
                                            onChange={handleInputChange}
                                            placeholder="Months"
                                            min="1"
                                            required
                                            style={UNDERLINE_INPUT_STYLES}
                                            onFocus={(e) => Object.assign(e.target.style, UNDERLINE_FOCUS_STYLES)}
                                            onBlur={(e) => Object.assign(e.target.style, UNDERLINE_INPUT_STYLES)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12} sm={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">End Date</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            readOnly
                                            style={READONLY_INPUT_STYLES}
                                        />
                                        <Form.Text className="form-text small">
                                            Auto-calculated
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="form-section-header mb-3 mt-4">
                                <i className="fas fa-dollar-sign text-danger"></i>
                                Financial Information
                            </div>
                            
                            {/* Monthly rent and total amount in one row */}
                            <Row className="mb-3">
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Monthly Rent (TSh) *</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="text"
                                            name="rent_amount_per_unit"
                                            value={formatNumberWithCommas(formData.rent_amount_per_unit)}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            required
                                            style={UNDERLINE_INPUT_STYLES}
                                            onFocus={(e) => Object.assign(e.target.style, UNDERLINE_FOCUS_STYLES)}
                                            onBlur={(e) => Object.assign(e.target.style, UNDERLINE_INPUT_STYLES)}
                                        />
                                    </Form.Group>
                                </Col>
                                
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Total Amount (TSh)</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="text"
                                            name="total_amount"
                                            value={formatNumberWithCommas(formData.total_amount)}
                                            readOnly
                                            style={READONLY_INPUT_STYLES}
                                        />
                                        <Form.Text className="form-text small">
                                            <i className="bi bi-calculator me-1"></i>
                                            Rent × Duration
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            {/* Discount field */}
                            <Row className="mb-3">
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Discount (TSh)</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="text"
                                            name="discount"
                                            value={formatNumberWithCommas(formData.discount)}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            style={UNDERLINE_INPUT_STYLES}
                                            onFocus={(e) => Object.assign(e.target.style, UNDERLINE_FOCUS_STYLES)}
                                            onBlur={(e) => Object.assign(e.target.style, UNDERLINE_INPUT_STYLES)}
                                        />
                                        <Form.Text className="form-text small">
                                            Optional
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Modal.Body>
                
                <Modal.Footer className="border-0 pt-0 d-flex justify-content-center gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={submitLoading}
                        className="odoo-btn odoo-btn-secondary"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={submitLoading}
                        className="odoo-btn odoo-btn-primary"
                    >
                        {submitLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating Lease...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check me-2"></i>
                                Create Lease
                            </>
                        )}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddLeaseModal;
