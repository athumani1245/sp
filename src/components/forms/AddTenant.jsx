import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createTenant } from '../../services/tenantService';
import '../../assets/styles/add-tenant.css';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_number: '',
        status: 'active',
        username: '',
        password: '',
        confirm_password: '',
        date_of_birth: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: ''
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            id_number: '',
            status: 'active',
            username: '',
            password: '',
            confirm_password: '',
            date_of_birth: '',
            address: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            notes: ''
        });
        setError('');
        setSuccess('');
        setPasswordErrors([]);
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

        // Auto-generate username from email if email is provided
        if (name === 'email' && value) {
            const emailUsername = value.split('@')[0];
            setFormData(prev => ({
                ...prev,
                username: emailUsername
            }));
        }

        // Validate password confirmation in real-time
        if (name === 'confirm_password' || name === 'password') {
            validatePasswords(
                name === 'password' ? value : formData.password,
                name === 'confirm_password' ? value : formData.confirm_password
            );
        }
    };

    const validatePasswords = (password, confirmPassword) => {
        const errors = [];
        
        if (password && password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (password && confirmPassword && password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        setPasswordErrors(errors);
    };

    const validateForm = () => {
        const requiredFields = [
            'first_name', 'last_name', 'username'
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }

        // Validate passwords if provided
        if (formData.password || formData.confirm_password) {
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                return false;
            }
            
            if (formData.password !== formData.confirm_password) {
                setError('Passwords do not match');
                return false;
            }
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
            // Prepare data for API call - only send required fields
            const tenantData = {
                username: formData.username,
                password: formData.password || 'DefaultPass123', // Use default if not provided
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: "Tenant"
            };

            // Call the tenant service
            const result = await createTenant(tenantData);
            
            if (result.success) {
                setSuccess(result.message || 'Tenant created successfully!');
                
                // Create enriched tenant object for callback
                const newTenant = {
                    id: result.data?.id || Date.now(),
                    ...tenantData,
                    created_at: new Date().toISOString(),
                    date_joined: new Date().toISOString()
                };

                // Call the callback with the new tenant data
                if (onTenantAdded) {
                    onTenantAdded(newTenant);
                }

                // Close modal after short delay to show success message
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // Ensure error is a string
                const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create tenant. Please try again.';
                setError(errorMessage);
            }

        } catch (error) {
            console.error('Failed to create tenant:', error);
            // Ensure error message is a string
            const errorMessage = error.message || 'Failed to create tenant. Please try again.';
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
                    <i className="bi bi-person-plus me-2"></i>
                    Add New Tenant
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <i className="bi bi-exclamation-triangle me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success">
                            <i className="bi bi-check-circle me-2" />
                            {success}
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <h6 className="mb-3">
                        <i className="bi bi-person me-2"></i>
                        Basic Information
                    </h6>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
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
                                    name="last_name"
                                    value={formData.last_name}
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
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>ID Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="id_number"
                                    value={formData.id_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter ID/Passport number"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter full address"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />

                    {/* Account Information */}
                    <h6 className="mb-3">
                        <i className="bi bi-shield-lock me-2"></i>
                        Account Information
                    </h6>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Auto-generated from email, but can be modified
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                    <option value="blacklisted">Blacklisted</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password (optional)"
                                />
                                <Form.Text className="text-muted">
                                    Leave empty to generate automatically
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleInputChange}
                                    placeholder="Confirm password"
                                    disabled={!formData.password}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {passwordErrors.length > 0 && (
                        <Alert variant="warning">
                            <ul className="mb-0">
                                {passwordErrors.map((error, errorIndex) => (
                                    <li key={`password-error-${Math.random()}`}>{error}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    <hr />

                    {/* Emergency Contact */}
                    <h6 className="mb-3">
                        <i className="bi bi-telephone me-2"></i>
                        Emergency Contact (Optional)
                    </h6>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter emergency contact name"
                                />
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact Phone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter emergency contact phone"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Enter any additional notes about the tenant"
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
                        disabled={submitLoading || passwordErrors.length > 0}
                    >
                        {submitLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                Creating Tenant...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check me-2"></i>
                                Create Tenant
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

AddTenantModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onTenantAdded: PropTypes.func
};

AddTenantModal.defaultProps = {
    onTenantAdded: null
};

export default AddTenantModal;
