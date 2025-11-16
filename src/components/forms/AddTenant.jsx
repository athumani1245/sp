import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { createTenant } from '../../services/tenantService';
import { InfoTooltip } from '../common/Tooltip';
import '../../assets/styles/add-tenant.css';
import '../../assets/styles/forms-responsive.css';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '', // will hold phone number
    });
    const [phoneNumber, setPhoneNumber] = useState('');

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
        setPhoneNumber('');
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
        setFormData(prev => ({
            ...prev,
            username: value || ''
        }));
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
        // Validate phone number format (international)
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
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
            centered
            className="responsive-modal"
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="text-center w-100 h5 fw-bold text-dark">
                    <i className="bi bi-person-plus me-2 text-danger"></i>
                    Add New Tenant
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" className="alert alert-danger">
                            <i className="bi bi-exclamation-triangle me-2" />
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success" className="alert alert-success">
                            <i className="bi bi-check-circle me-2" />
                            {success}
                        </Alert>
                    )}

                    <div className="form-section-header mb-form-section">
                        <i className="fas fa-user text-danger"></i>
                        Tenant Information
                    </div>
                    <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">
                                    First Name *
                                    <InfoTooltip content="Tenant's legal first name as it appears on official documents" />
                                </Form.Label>
                                <Form.Control
                                    className="form-control"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">
                                    Last Name *
                                    <InfoTooltip content="Tenant's legal last name (surname/family name)" />
                                </Form.Label>
                                <Form.Control
                                    className="form-control"
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
                    <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">
                                    Phone Number *
                                    <InfoTooltip content="Primary contact number. This will be used as the tenant's username for login and communications." />
                                </Form.Label>
                                <div className="phone-input-wrapper">
                                    <PhoneInput
                                        international
                                        countryCallingCodeEditable={false}
                                        defaultCountry="TZ"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        className="phone-input-custom"
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <div className="info-card p-3 bg-light rounded">
                                <h6 className="text-muted mb-2">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Information:
                                </h6>
                                <p className="small mb-1">Tenant Will be selected on Creation of Lease</p>
                                <p className="small mb-0">All information filled in here will also appear on Lease</p>
                                <small className="text-muted">after Lease creation, Tenant can not be deleted.</small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                
                <Modal.Footer className="border-0 pt-0">
                    <Button 
                        variant="secondary" 
                        onClick={onClose}
                        disabled={submitLoading}
                        className="odoo-btn odoo-btn-secondary"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitLoading}
                        className="odoo-btn odoo-btn-primary"
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
