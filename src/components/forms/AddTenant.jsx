import React from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { InfoTooltip } from '../common/Tooltip';
import { useTenantForm } from '../../features/tenants/hooks/useTenantForm';
import { useTenantSubmit } from '../../features/tenants/hooks/useTenantSubmit';
import '../../assets/styles/add-tenant.css';
import '../../assets/styles/forms-responsive.css';

const AddTenantModal = ({ isOpen, onClose, onTenantAdded }) => {
    const {
        formData,
        phoneNumber,
        handleInputChange,
        handlePhoneChange,
        validateForm
    } = useTenantForm(isOpen);

    const {
        submitLoading,
        error,
        success,
        setError,
        setSuccess,
        handleSubmit
    } = useTenantSubmit(formData, onTenantAdded, onClose);

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
            
            <Form onSubmit={(e) => handleSubmit(e, validateForm)}>
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
