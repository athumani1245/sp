import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { getProperties, getPropertyUnits } from '../../services/propertyService';
import { createLease } from '../../services/leaseService';
import '../../assets/styles/add-lease.css';





const AddLeaseModal = ({ isOpen, onClose, onLeaseAdded }) => {
    const [formData, setFormData] = useState({
        property_id: '',
        unit_id: '',
        tenant_first_name: '',
        tenant_last_name: '',
        tenant_phone: '',
        tenant_id_number: '',
        start_date: '',
        lease_months: '',
        end_date: '',
        monthly_rent: '',
        total_amount: '',
        security_deposit: '',
        amount_paid: '',
        paid_amount: '',
        discount: ''
    });

    const [properties, setProperties] = useState([]);
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
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            property_id: '',
            unit_id: '',
            tenant_first_name: '',
            tenant_last_name: '',
            tenant_phone: '',
            tenant_id_number: '',
            start_date: '',
            lease_months: '',
            end_date: '',   
            monthly_rent: '',
            total_amount: '',
            security_deposit: '',
            amount_paid: '',
            paid_amount: '',
            discount: ''
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
            const result = await getPropertyUnits({ property: propertyId });
            
            if (result.success) {
                // Filter only available units (assuming units have a status field)
                const availableUnits = result.data.filter(unit => 
                    !unit.status || unit.status === 'available' || unit.status === 'vacant'
                );
                setAvailableUnits(availableUnits);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear previous errors
        setError('');
        setSuccess('');

        // Load units when property is selected
        if (name === 'property_id' && value) {
            loadAvailableUnits(value);
            setFormData(prev => ({ ...prev, unit_id: '', monthly_rent: '' }));
        }

        // Auto-fill rent amount when unit is selected
        if (name === 'unit_id' && value) {
            const selectedUnit = availableUnits.find(unit => unit.id.toString() === value);
            if (selectedUnit) {
                const rentAmount = selectedUnit.rent_per_month || selectedUnit.rent_amount || 0;
                setFormData(prev => ({ 
                    ...prev, 
                    monthly_rent: rentAmount,
                    total_amount: formData.lease_months ? calculateTotalAmount(rentAmount, formData.lease_months) : ''
                }));
            }
        }

        // Calculate end date when start date or lease months change
        if (name === 'start_date' || name === 'lease_months') {
            const startDate = name === 'start_date' ? value : formData.start_date;
            const months = name === 'lease_months' ? value : formData.lease_months;
            
            if (startDate && months) {
                const endDate = calculateEndDate(startDate, months);
                setFormData(prev => ({ 
                    ...prev, 
                    end_date: endDate,
                    total_amount: formData.monthly_rent ? calculateTotalAmount(formData.monthly_rent, months) : ''
                }));
            }
        }

        // Calculate total amount when monthly rent changes
        if (name === 'monthly_rent') {
            if (value && formData.lease_months) {
                const totalAmount = calculateTotalAmount(value, formData.lease_months);
                setFormData(prev => ({ ...prev, total_amount: totalAmount }));
            }
        }
    };

    const validateForm = () => {
        const requiredFields = [
            'property_id', 'unit_id', 'tenant_first_name', 'tenant_last_name', 
            'start_date', 'lease_months', 'monthly_rent'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }

        // Validate lease months
        if (formData.lease_months <= 0) {
            setError('Lease months must be greater than 0');
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
            // Call the actual lease service
            const result = await createLease(formData);
            
            if (result.success) {
                setSuccess(result.message || 'Lease created successfully!');
                
                // Create enriched lease object for callback
                const newLease = {
                    id: result.data?.id || Date.now(),
                    tenant_first_name: formData.tenant_first_name,
                    tenant_last_name: formData.tenant_last_name,
                    tenant_name: `${formData.tenant_first_name} ${formData.tenant_last_name}`.trim(),
                    tenant_phone: formData.tenant_phone,
                    tenant_id_number: formData.tenant_id_number,
                    property_id: formData.property_id,
                    unit_id: formData.unit_id,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    lease_months: formData.lease_months,
                    monthly_rent: formData.monthly_rent,
                    total_amount: formData.total_amount,
                    amount_paid: formData.paid_amount || 0,
                    discount: formData.discount || 0,
                    security_deposit: formData.security_deposit,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    // Get property and unit names for display
                    property_name: properties.find(p => p.id.toString() === formData.property_id)?.property_name || 'Unknown Property',
                    unit_number: availableUnits.find(u => u.id.toString() === formData.unit_id)?.unit_name || 
                               availableUnits.find(u => u.id.toString() === formData.unit_id)?.unit_number || 'Unknown Unit'
                };

                // Call the callback with the new lease data
                if (onLeaseAdded) {
                    onLeaseAdded(newLease);
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
            size="lg" 
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-file-earmark-plus me-2"></i>
                    Add New Lease Agreement
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success">
                            <i className="bi bi-check-circle me-2"></i>
                            {success}
                        </Alert>
                    )}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Property *</Form.Label>
                                <Form.Select
                                    name="property_id"
                                    value={formData.property_id}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(property => (
                                        <option key={property.id} value={property.id}>
                                            {property.property_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Available Unit *</Form.Label>
                                <Form.Select
                                    name="unit_id"
                                    value={formData.unit_id}
                                    onChange={handleInputChange}
                                    disabled={!formData.property_id || loading}
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    {availableUnits.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unit_name || unit.unit_number} - TSh {(unit.rent_per_month || unit.rent_amount || 0).toLocaleString()}/month
                                        </option>
                                    ))}
                                </Form.Select>
                                {loading && formData.property_id && (
                                    <Form.Text className="text-muted">
                                        Loading available units...
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <h6 className="mb-3">
                        <i className="bi bi-person me-2"></i>
                        Tenant Information
                    </h6>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tenant_first_name"
                                    value={formData.tenant_first_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tenant_last_name"
                                    value={formData.tenant_last_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter last name"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="tenant_phone"
                                    value={formData.tenant_phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>ID Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tenant_id_number"
                                    value={formData.tenant_id_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter ID/Passport number"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <h6 className="mb-3">
                        <i className="bi bi-calendar me-2"></i>
                        Lease Terms
                    </h6>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Lease Duration (Months) *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="lease_months"
                                    value={formData.lease_months}
                                    onChange={handleInputChange}
                                    placeholder="Enter number of months"
                                    min="1"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    readOnly
                                    className="bg-light"
                                />
                                <Form.Text className="text-muted">
                                    Auto-calculated
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Monthly Rent (TSh) *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="monthly_rent"
                                    value={formData.monthly_rent}
                                    onChange={handleInputChange}
                                    placeholder="Enter monthly rent amount"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Total Amount (TSh)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="total_amount"
                                    value={formData.total_amount}
                                    readOnly
                                    className="bg-light"
                                />
                                <Form.Text className="text-muted">
                                    Monthly rent × Duration
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Paid Amount (TSh)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="paid_amount"
                                    value={formData.paid_amount}
                                    onChange={handleInputChange}
                                    placeholder="Enter paid amount"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Discount (TSh)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    placeholder="Enter discount amount"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={onClose}
                        disabled={submitLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitLoading}
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
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddLeaseModal;
