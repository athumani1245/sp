import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { getProperties, getAvailableUnits } from '../../services/propertyService';
import { createLease } from '../../services/leaseService';
import { getTenants } from '../../services/tenantService';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/formatUtils';
import '../../assets/styles/add-lease.css';
import '../../assets/styles/forms-responsive.css';

// Add custom styles for underlined inputs
const underlineInputStyles = {
    border: 'none',
    borderBottom: '2px solid #dee2e6',
    borderRadius: '0',
    backgroundColor: 'transparent',
    padding: '8px 0',
    fontSize: '0.95rem',
    transition: 'border-bottom-color 0.3s ease',
    boxShadow: 'none'
};

const underlineInputFocusStyles = {
    border: 'none',
    borderBottom: '2px solid #CC5B4B',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    outline: 'none'
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        const handleKeyDown = (event) => {
            // Handle Escape key to close dropdown
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    };

    const handleOptionSelect = (option) => {
        const optionValue = getOptionValue(option);
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
    };

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
                    ...underlineInputStyles,
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
    });

    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            resetForm();
            loadProperties();
            loadTenants();
        }
    }, [isOpen]);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const result = await getTenants();
            if (result.success) {
                setTenants(result.data || []);
            } else {
                setError('Failed to load tenants');
            }
        } catch (error) {
            console.error('Failed to load tenants:', error);
            setError('Failed to load tenants');
        } finally {
            setLoading(false);
        }
    };

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
        });
        setAvailableUnits([]);
        setError('');
        setSuccess('');
    };

    const loadProperties = async () => {
        try {
            setLoading(true);
            const result = await getProperties();
            if (result.success) {
                setProperties(result.data || []);
            } else {
                setError('Failed to load properties');
            }
        } catch (error) {
            console.error('Failed to load properties:', error);
            setError('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    // Load available units for a property using the actual service
    const loadAvailableUnits = async (propertyId) => {
        try {
            setLoading(true);
            const result = await getAvailableUnits({ property: propertyId });
            
            if (result.success) {
                // No need to filter since API already returns only available units
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
    };

    // Calculate end date based on start date and number of months
    const calculateEndDate = (startDate, months) => {
        if (!startDate || !months || months <= 0) return '';
        
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(start.getMonth() + parseInt(months));
        
        // Format to YYYY-MM-DD for input field
        return end.toISOString().split('T')[0];
    };

    // Calculate total amount based on monthly rent and lease duration
    const calculateTotalAmount = (monthlyRent, months) => {
        if (!monthlyRent || !months || monthlyRent <= 0 || months <= 0) return '';
        
        const total = parseFloat(monthlyRent) * parseInt(months);
        return total.toString();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle monetary fields with comma formatting
        const monetaryFields = ['rent_amount_per_unit', 'amount_paid', 'discount'];
        
        if (monetaryFields.includes(name)) {
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

        // Clear previous errors
        setError('');
        setSuccess('');

        // Load units when property is selected
        if (name === 'property_id' && value) {
            loadAvailableUnits(value);
            setFormData(prev => ({ ...prev, unit: '', rent_amount_per_unit: '' }));
        }

        // Auto-fill tenant details when tenant is selected
        if (name === 'tenant_id' && value) {
            console.log('Selected tenant ID:', value);
            console.log('Available tenants:', tenants);
            const selectedTenant = tenants.find(tenant => tenant.id === parseInt(value) || tenant.id === value);
            console.log('Selected tenant:', selectedTenant);
            if (selectedTenant) {
                setFormData(prev => {
                    console.log('Setting tenant data:', {
                        first_name: selectedTenant.first_name,
                        last_name: selectedTenant.last_name,
                        tenant_phone: selectedTenant.phone || selectedTenant.username || ''
                    });
                    return {
                        ...prev,
                        first_name: selectedTenant.first_name,
                        last_name: selectedTenant.last_name,
                        tenant_phone: selectedTenant.phone || selectedTenant.username || ''
                    };
                });
            }
        }

        // Auto-fill rent amount when unit is selected
        if (name === 'unit' && value) {
            const selectedUnit = availableUnits.find(unit => unit.id.toString() === value);
            if (selectedUnit) {
                const rentAmount = selectedUnit.rent_per_month || selectedUnit.rent_amount || 0;
                setFormData(prev => ({ 
                    ...prev, 
                    rent_amount_per_unit: rentAmount,
                    total_amount: formData.number_of_month ? calculateTotalAmount(rentAmount, formData.number_of_month) : ''
                }));
            }
        }

        // Calculate end date when start date or number of months change
        if (name === 'start_date' || name === 'number_of_month') {
            const startDate = name === 'start_date' ? value : formData.start_date;
            const months = name === 'number_of_month' ? value : formData.number_of_month;
            
            if (startDate && months) {
                const endDate = calculateEndDate(startDate, months);
                setFormData(prev => ({ 
                    ...prev, 
                    end_date: endDate,
                    total_amount: formData.rent_amount_per_unit ? calculateTotalAmount(formData.rent_amount_per_unit, months) : ''
                }));
            }
        }

        // Calculate total amount when monthly rent changes
        if (name === 'rent_amount_per_unit') {
            const rawValue = parseFormattedNumber(value);
            if (rawValue && formData.number_of_month) {
                const totalAmount = calculateTotalAmount(rawValue, formData.number_of_month);
                setFormData(prev => ({ ...prev, total_amount: totalAmount }));
            }
        }
    };

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
                total_amount: formData.total_amount
            };

            console.log('Submitting lease data:', leaseData);

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

                            {/* Display selected tenant info */}
                            {formData.tenant_id && (
                                <div className="mt-4 p-3 bg-light rounded">
                                    <h6 className="text-primary mb-2">
                                        <i className="bi bi-person-check me-2"></i>
                                        Selected Tenant Information
                                    </h6>
                                    <div className="small text-muted">
                                        <div><strong>Name:</strong> {formData.first_name} {formData.last_name}</div>
                                        <div><strong>Contact:</strong> {formData.tenant_phone}</div>
                                    </div>
                                </div>
                            )}

                            {/* Display selected property/unit info */}
                            {formData.property_id && formData.unit && (
                                <div className="mt-3 p-3 bg-light rounded">
                                    <h6 className="text-success mb-2">
                                        <i className="bi bi-building-check me-2"></i>
                                        Selected Property & Unit
                                    </h6>
                                    <div className="small text-muted">
                                        <div><strong>Property:</strong> {properties.find(p => p.id === formData.property_id)?.property_name}</div>
                                        <div><strong>Unit:</strong> {availableUnits.find(u => u.id.toString() === formData.unit)?.unit_name}</div>
                                        <div><strong>Rent:</strong> TSh {formatNumberWithCommas(formData.rent_amount_per_unit)}/month</div>
                                    </div>
                                </div>
                            )}
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
                                            style={underlineInputStyles}
                                            onFocus={(e) => Object.assign(e.target.style, underlineInputFocusStyles)}
                                            onBlur={(e) => Object.assign(e.target.style, underlineInputStyles)}
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
                                            style={underlineInputStyles}
                                            onFocus={(e) => Object.assign(e.target.style, underlineInputFocusStyles)}
                                            onBlur={(e) => Object.assign(e.target.style, underlineInputStyles)}
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
                                            style={{
                                                ...underlineInputStyles,
                                                backgroundColor: 'transparent',
                                                cursor: 'not-allowed',
                                                color: '#6c757d',
                                                borderBottomColor: '#e9ecef'
                                            }}
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
                                            style={underlineInputStyles}
                                            onFocus={(e) => Object.assign(e.target.style, underlineInputFocusStyles)}
                                            onBlur={(e) => Object.assign(e.target.style, underlineInputStyles)}
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
                                            style={{
                                                ...underlineInputStyles,
                                                backgroundColor: 'transparent',
                                                cursor: 'not-allowed',
                                                color: '#6c757d',
                                                borderBottomColor: '#e9ecef'
                                            }}
                                        />
                                        <Form.Text className="form-text small">
                                            <i className="bi bi-calculator me-1"></i>
                                            Rent × Duration
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            {/* Paid amount and discount in one row */}
                            <Row className="mb-3">
                                <Col xs={12} sm={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="form-label">Paid Amount (TSh)</Form.Label>
                                        <Form.Control
                                            className="form-control"
                                            type="text"
                                            name="amount_paid"
                                            value={formatNumberWithCommas(formData.amount_paid)}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            style={underlineInputStyles}
                                            onFocus={(e) => Object.assign(e.target.style, underlineInputFocusStyles)}
                                            onBlur={(e) => Object.assign(e.target.style, underlineInputStyles)}
                                        />
                                    </Form.Group>
                                </Col>
                                
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
                                            style={underlineInputStyles}
                                            onFocus={(e) => Object.assign(e.target.style, underlineInputFocusStyles)}
                                            onBlur={(e) => Object.assign(e.target.style, underlineInputStyles)}
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
