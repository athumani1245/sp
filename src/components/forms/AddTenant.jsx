import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createTenant } from '../../services/tenantService';
import '../../assets/styles/add-tenant.css';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '', // will hold phone number
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            username: '',
        });
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // For phone input, store in username
        if (name === 'phone') {
            setFormData(prev => ({
                ...prev,
                username: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setError('');
        setSuccess('');
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
        // Validate phone number format (basic)
        if (!/^0\d{9}$/.test(formData.username)) {
            setError('Phone number must be 10 digits and start with 0');
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
            // Only send required fields, set default password
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

                    {/* Only required fields */}
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
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number (e.g. 0712345678)"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    This will be used as the username
                                </Form.Text>
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
