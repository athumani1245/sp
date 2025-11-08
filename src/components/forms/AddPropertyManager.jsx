import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { registerPropertyManager, updatePropertyManager } from '../../services/propertyService';
import '../../assets/styles/register.css';

const AddPropertyManagerModal = ({ isOpen, onClose, onManagerAdded, manager }) => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (manager) {
            setFormData({
                username: manager.username || '',
                first_name: manager.first_name || '',
                last_name: manager.last_name || ''
            });
        } else {
            setFormData({
                username: '',
                first_name: '',
                last_name: ''
            });
        }
        setError('');
    }, [manager, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handlePhoneChange = (value) => {
        setFormData(prev => ({
            ...prev,
            username: value || ''
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Phone number is required');
            return false;
        }

        if (!formData.first_name.trim()) {
            setError('First name is required');
            return false;
        }

        if (!formData.last_name.trim()) {
            setError('Last name is required');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = manager 
                ? await updatePropertyManager(manager.id, formData)
                : await registerPropertyManager(formData);

            if (result.success) {
                onManagerAdded();
            } else {
                setError(result.error || 'Failed to save property manager');
            }
        } catch (err) {
            setError('An error occurred while saving property manager');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            show={isOpen} 
            onHide={onClose} 
            size="md"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title>
                    <i className="bi bi-person-plus me-2 text-primary"></i>
                    {manager ? 'Edit Property Manager' : 'Add Property Manager'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" className="mb-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    <Row className="g-3">
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="form-label">
                                    Phone Number *
                                </Form.Label>
                                <div className="phone-input-wrapper">
                                    <PhoneInput
                                        international
                                        countryCallingCodeEditable={false}
                                        defaultCountry="TZ"
                                        value={formData.username}
                                        onChange={handlePhoneChange}
                                        className="phone-input-custom"
                                        placeholder="Enter phone number"
                                        disabled={!!manager}
                                        required
                                    />
                                </div>
                                <Form.Text className="text-muted">
                                    Phone number will be used as username
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="form-label">
                                    First Name *
                                </Form.Label>
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

                        <Col xs={12} sm={6}>
                            <Form.Group>
                                <Form.Label className="form-label">
                                    Last Name *
                                </Form.Label>
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
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="odoo-btn odoo-btn-secondary"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="odoo-btn odoo-btn-primary"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                {manager ? 'Updating...' : 'Registering...'}
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                {manager ? 'Update Manager' : 'Register Manager'}
                            </>
                        )}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPropertyManagerModal;
