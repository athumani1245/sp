import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import '../../assets/styles/forms-responsive.css';
import { createPayment } from '../../services/paymentService';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/formatUtils';

const AddPayment = ({ isOpen, onClose, leaseId, onPaymentAdded }) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        amount_paid: '',
        date_paid: new Date().toISOString().slice(0, 10), // Format: YYYY-MM-DD
        category: 'RENT',
        payment_source: 'CASH'
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
            date_paid: new Date().toISOString().slice(0, 10),
            category: 'RENT',
            payment_source: 'CASH'
        });
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'amount_paid') {
            // Handle monetary input with comma formatting
            const rawValue = parseFormattedNumber(value);
            setFormData(prevState => ({
                ...prevState,
                [name]: rawValue
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
        
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.amount_paid) {
            setError('Please enter the payment amount');
            return false;
        }
        if (!formData.date_paid) {
            setError('Please select the payment date');
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
                    category: 'RENT'
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
            centered
            className="responsive-modal"
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="text-center w-100 h5 fw-bold text-dark">
                    <i className="bi bi-credit-card me-2 text-danger"></i>
                    Record Payment
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
                        <i className="fas fa-money-bill-wave text-danger"></i>
                        Payment Information
                    </div>

                    <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Amount (TSh) *</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text">TSh</span>
                                    <Form.Control
                                        className="form-control"
                                        type="text"
                                        name="amount_paid"
                                        value={formatNumberWithCommas(formData.amount_paid)}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Payment Date *</Form.Label>
                                <Form.Control
                                    className="form-control"
                                    type="date"
                                    name="date_paid"
                                    value={formData.date_paid}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Category *</Form.Label>
                                <Form.Select
                                    className="form-select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="RENT">Rent</option>
                                    <option value="WATER">Water</option>
                                    <option value="ELECTRICITY">Electricity</option>
                                    <option value="SERVICE_CHARGE">Service Charge</option>
                                    <option value="Security Deposit">Security Deposit</option>
                                    <option value="OTHER">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Payment Source *</Form.Label>
                                <Form.Select
                                    className="form-select"
                                    name="payment_source"
                                    value={formData.payment_source}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="MB">Mobile Money</option>
                                    <option value="BANK">Bank</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                
                <Modal.Footer className="border-0 pt-0">
                    <Button 
                        variant="secondary" 
                        onClick={onClose}
                        disabled={submitLoading}
                        className="btn btn-secondary"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitLoading}
                        className="btn btn-primary"
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
