import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createPayment } from '../../services/paymentService';

const AddPayment = ({ isOpen, onClose, leaseId, onPaymentAdded }) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        amount_paid: '',
        date_paid: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
        category: 'RENT',
        status: 'success'
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            amount_paid: '',
            date_paid: new Date().toISOString().slice(0, 16),
            category: 'RENT',
            status: 'success'
        });
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.amount_paid) {
            setError('Please enter the payment amount');
            return false;
        }
        if (!formData.date_paid) {
            setError('Please select the payment date and time');
            return false;
        }
        if (parseFloat(formData.amount_paid) <= 0) {
            setError('Payment amount must be greater than 0');
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
            const paymentData = {
                ...formData,
                lease: leaseId
            };

            const response = await createPayment(paymentData);

            if (response.success) {
                setSuccess('Payment added successfully!');
                setFormData({
                    amount_paid: '',
                    date_paid: new Date(),
                    category: 'RENT',
                    status: 'success'
                });
                if (onPaymentAdded) {
                    onPaymentAdded(response.data);
                }
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(response.error || 'Failed to add payment');
            }
        } catch (err) {
            setError('An error occurred while adding the payment');
            console.error('Payment error:', err);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal 
            show={isOpen} 
            onHide={onClose} 
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-credit-card me-2"></i>
                    Record Payment
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

                    <h6 className="mb-3">
                        <i className="bi bi-cash me-2"></i>
                        Payment Details
                    </h6>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Amount *</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">TSh</span>
                                    <Form.Control
                                        type="number"
                                        name="amount_paid"
                                        value={formData.amount_paid}
                                        onChange={handleInputChange}
                                        placeholder="Enter amount"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Payment Date & Time *</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="date_paid"
                                    value={formData.date_paid}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="RENT">Rent</option>
                                    <option value="DEPOSIT">Deposit</option>
                                    <option value="UTILITIES">Utilities</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="OTHER">Other</option>
                                </Form.Select>
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
                                Recording Payment...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check me-2"></i>
                                Record Payment
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPayment;
