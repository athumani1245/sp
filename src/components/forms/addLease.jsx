import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { getProperties, getPropertyUnits } from '../../services/propertyService';
import { createLease } from '../../services/leaseService';
import { getTenants } from '../../services/tenantService';
import '../../assets/styles/add-lease.css';





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
            if (value && formData.number_of_month) {
                const totalAmount = calculateTotalAmount(value, formData.number_of_month);
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
                                    name="unit"
                                    value={formData.unit}
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
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Tenant *</Form.Label>
                                <Form.Select
                                    name="tenant_id"
                                    value={formData.tenant_id}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.first_name} {tenant.last_name} - {tenant.username || tenant.phone}
                                        </option>
                                    ))}
                                </Form.Select>
                                {tenants.length === 0 && (
                                    <Form.Text className="text-muted">
                                        No tenants available. Please add a tenant first.
                                    </Form.Text>
                                )}
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
                                    name="number_of_month"
                                    value={formData.number_of_month}
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
                                    name="rent_amount_per_unit"
                                    value={formData.rent_amount_per_unit}
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
                                    name="amount_paid"
                                    value={formData.amount_paid}
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
