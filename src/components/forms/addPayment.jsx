import React from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../assets/styles/forms-responsive.css';
import { usePaymentForm } from '../../features/leases/hooks/usePaymentForm';
import { usePaymentSubmit } from '../../features/leases/hooks/usePaymentSubmit';

const AddPayment = ({ isOpen, onClose, leaseId, onPaymentAdded }) => {
    const {
        formData,
        handleInputChange,
        validateForm,
        formatNumberWithCommas
    } = usePaymentForm(isOpen);

    const {
        submitLoading,
        error,
        success,
        setError,
        setSuccess,
        handleSubmit
    } = usePaymentSubmit(formData, leaseId, onPaymentAdded, onClose);

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

AddPayment.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    leaseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onPaymentAdded: PropTypes.func
};

AddPayment.defaultProps = {
    onPaymentAdded: null
};

export default AddPayment;
