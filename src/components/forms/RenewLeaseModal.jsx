import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/formatUtils';
import { renewLease } from '../../services/leaseService';

// Helper function to parse DD-MM-YYYY format dates
const parseDateFromDDMMYYYY = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const RenewLeaseModal = ({ show, onHide, lease, onRenewalSuccess }) => {
    const [formData, setFormData] = useState({
        start_date: '',
        duration_months: '',
        monthly_rent: ''
    });
    const [endDate, setEndDate] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        if (lease && show) {
            // Parse the end date (DD-MM-YYYY format)
            const currentEndDate = parseDateFromDDMMYYYY(lease.end_date) || new Date(lease.end_date);
            const newStartDate = new Date(currentEndDate);
            newStartDate.setDate(newStartDate.getDate() + 1);
            
            // Format date as YYYY-MM-DD without timezone conversion
            const year = newStartDate.getFullYear();
            const month = String(newStartDate.getMonth() + 1).padStart(2, '0');
            const day = String(newStartDate.getDate()).padStart(2, '0');
            const formattedStartDate = `${year}-${month}-${day}`;
            
            setFormData({
                start_date: formattedStartDate,
                duration_months: lease.duration_months || '6',
                monthly_rent: formatNumberWithCommas(lease.rent_amount_per_unit || lease.monthly_rent || '0')
            });
            
            // Calculate initial end date
            calculateEndDate(formattedStartDate, lease.duration_months || '6');
        }
    }, [lease, show]);

    const calculateEndDate = (startDate, durationMonths) => {
        if (!startDate || !durationMonths) {
            setEndDate('');
            return;
        }

        const start = new Date(startDate);
        
        // Validate the start date
        if (isNaN(start.getTime())) {
            setEndDate('');
            return;
        }
        
        const duration = parseInt(durationMonths);
        
        if (isNaN(duration) || duration <= 0) {
            setEndDate('');
            return;
        }

        const end = new Date(start);
        end.setMonth(end.getMonth() + duration);
        end.setDate(end.getDate() - 1); // Subtract 1 day to get the last day of the lease
        
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'monthly_rent') {
            // Remove any non-digit characters except commas
            const numericValue = value.replace(/[^\d,]/g, '');
            const unformattedValue = parseFormattedNumber(numericValue);
            const formattedValue = formatNumberWithCommas(unformattedValue);
            
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Recalculate end date when start date or duration changes
        if (name === 'start_date') {
            calculateEndDate(value, formData.duration_months);
        } else if (name === 'duration_months') {
            calculateEndDate(formData.start_date, value);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (!formData.duration_months || parseInt(formData.duration_months) <= 0) {
            newErrors.duration_months = 'Duration must be greater than 0';
        }

        const rentAmount = parseFormattedNumber(formData.monthly_rent);
        if (!rentAmount || rentAmount <= 0) {
            newErrors.monthly_rent = 'Monthly rent must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
            const formatDateForApi = (dateString) => {
                if (!dateString) return "";
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            // Calculate total amount (rent * duration)
            const monthlyRent = parseFormattedNumber(formData.monthly_rent);
            const duration = parseInt(formData.duration_months);
            const totalAmount = monthlyRent * duration;

            // Format payments array
            const formattedPayments = payments.map(payment => ({
                amount_paid: parseFormattedNumber(payment.amount).toString(),
                payment_source: payment.source,
                category: payment.category,
                payment_date: formatDateForApi(new Date().toISOString().split('T')[0]) // Current date
            }));

            const renewalData = {
                original_lease: lease.id,
                start_date: formatDateForApi(formData.start_date),
                end_date: formatDateForApi(endDate),
                number_of_month: duration,
                rent_amount_per_unit: monthlyRent,
                total_amount: totalAmount,
                payments: formattedPayments
            };

            const result = await renewLease(lease.id, renewalData);

            if (result.success) {
                if (onRenewalSuccess) {
                    onRenewalSuccess(result.data);
                }
                handleClose();
            } else {
                setApiError(result.error || 'Failed to renew lease');
            }
        } catch (error) {
            setApiError('An error occurred while renewing the lease');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            start_date: '',
            duration_months: '',
            monthly_rent: ''
        });
        setEndDate('');
        setErrors({});
        setApiError('');
        setPayments([]);
        onHide();
    };

    const handleAddPayment = () => {
        const newPayment = {
            id: Date.now(),
            category: 'RENT',
            amount: '',
            source: 'CASH',
            confirmed: false
        };
        setPayments([...payments, newPayment]);
    };

    const handleRemovePayment = (paymentId) => {
        setPayments(payments.filter(p => p.id !== paymentId));
    };

    const handleConfirmPayment = (paymentId) => {
        setPayments(payments.map(payment => 
            payment.id === paymentId 
                ? { ...payment, confirmed: true }
                : payment
        ));
    };

    const handlePaymentChange = (paymentId, field, value) => {
        setPayments(payments.map(payment => 
            payment.id === paymentId 
                ? { ...payment, [field]: value }
                : payment
        ));
    };

    if (!lease) return null;

    // Helper function to get unit information
    const getUnitInfo = () => {
        if (lease.unit_number) {
            return lease.unit_number;
        } else if (lease.unit_name) {
            return lease.unit_name;
        } else if (lease.unit && lease.unit.unit_name) {
            return lease.unit.unit_name;
        } else if (lease.unit && lease.unit.unit_number) {
            return lease.unit.unit_number;
        }
        return 'N/A';
    };

    // Helper function to get property name
    const getPropertyName = () => {
        if (lease.property && lease.property.property_name) {
            return lease.property.property_name;
        } else if (lease.property && lease.property.name) {
            return lease.property.name;
        } else if (lease.property_name) {
            return lease.property_name;
        }
        return 'N/A';
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-arrow-repeat text-primary me-2"></i>
                    Renew Lease
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {apiError && (
                        <Alert variant="danger" dismissible onClose={() => setApiError('')}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {apiError}
                        </Alert>
                    )}

                    {/* Current Lease Information (Read-only) */}
                    <div className="mb-4 p-3 bg-light rounded">
                        <h6 className="mb-3 text-muted">Current Lease Information</h6>
                        <Row>
                            <Col md={6}>
                                <div className="mb-2">
                                    <small className="text-muted d-block">Property</small>
                                    <strong>{getPropertyName()}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-2">
                                    <small className="text-muted d-block">Unit</small>
                                    <strong>{getUnitInfo()}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-2">
                                    <small className="text-muted d-block">Tenant</small>
                                    <strong>
                                        {lease.tenant?.first_name && lease.tenant?.last_name 
                                            ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
                                            : lease.tenant?.username || 'N/A'}
                                    </strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-2">
                                    <small className="text-muted d-block">Current End Date</small>
                                    <strong className="text-danger">
                                        {lease.end_date}
                                    </strong>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Renewal Details */}
                    <h6 className="mb-3">Renewal Details</h6>
                    
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>
                                    New Start Date <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    isInvalid={!!errors.start_date}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.start_date}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>
                                    Duration (Months) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="duration_months"
                                    value={formData.duration_months}
                                    onChange={handleChange}
                                    min="1"
                                    isInvalid={!!errors.duration_months}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.duration_months}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>New End Date</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}
                                    readOnly
                                    disabled
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>
                                    New Monthly Rent (TSh) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="monthly_rent"
                                    value={formData.monthly_rent}
                                    onChange={handleChange}
                                    placeholder="0"
                                    isInvalid={!!errors.monthly_rent}
                                    disabled={isSubmitting}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.monthly_rent}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Current rent: TSh {formatNumberWithCommas(lease.rent_amount_per_unit || lease.monthly_rent || '0')}
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Payment Section */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Initial Payments (Optional)</h6>
                            <button
                                type="button"
                                className="odoo-btn odoo-btn-sm odoo-btn-primary"
                                onClick={handleAddPayment}
                                disabled={isSubmitting}
                            >
                                <i className="bi bi-plus-circle me-1"></i>
                                Add Payment
                            </button>
                        </div>

                        {payments.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '35%', border: 'none', fontWeight: '500', fontSize: '0.85rem', color: '#6c757d' }}>Category</th>
                                            <th style={{ width: '35%', border: 'none', fontWeight: '500', fontSize: '0.85rem', color: '#6c757d' }}>Amount (TSh)</th>
                                            <th style={{ width: '25%', border: 'none', fontWeight: '500', fontSize: '0.85rem', color: '#6c757d' }}>Source</th>
                                            <th style={{ width: '5%', border: 'none' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td style={{ border: 'none', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                                    <Form.Select
                                                        size="sm"
                                                        value={payment.category}
                                                        onChange={(e) => handlePaymentChange(payment.id, 'category', e.target.value)}
                                                        disabled={isSubmitting || payment.confirmed}
                                                    >
                                                        <option value="RENT">Rent</option>
                                                        <option value="Security Deposit">Security Deposit</option>
                                                        <option value="WATER">Water</option>
                                                        <option value="ELECTRICITY">Electricity</option>
                                                        <option value="SERVICE_CHARGE">Service Charge</option>
                                                        <option value="OTHER">Other</option>
                                                    </Form.Select>
                                                </td>
                                                <td style={{ border: 'none', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        value={payment.amount}
                                                        onChange={(e) => {
                                                            const numericValue = e.target.value.replace(/[^\d,]/g, '');
                                                            const unformatted = parseFormattedNumber(numericValue);
                                                            const formatted = formatNumberWithCommas(unformatted);
                                                            handlePaymentChange(payment.id, 'amount', formatted);
                                                        }}
                                                        placeholder="0"
                                                        disabled={isSubmitting || payment.confirmed}
                                                    />
                                                </td>
                                                <td style={{ border: 'none', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                                    <Form.Select
                                                        size="sm"
                                                        value={payment.source}
                                                        onChange={(e) => handlePaymentChange(payment.id, 'source', e.target.value)}
                                                        disabled={isSubmitting || payment.confirmed}
                                                    >
                                                        <option value="CASH">Cash</option>
                                                        <option value="BANK">Bank</option>
                                                        <option value="MOBILE_MONEY">Mobile Money</option>
                                                    </Form.Select>
                                                </td>
                                                <td className="text-center" style={{ border: 'none', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                                    {!payment.confirmed ? (
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success p-1"
                                                                onClick={() => handleConfirmPayment(payment.id)}
                                                                disabled={isSubmitting || !payment.amount}
                                                                title="Confirm payment"
                                                                style={{ width: '28px', height: '28px' }}
                                                            >
                                                                <i className="bi bi-check"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger p-1"
                                                                onClick={() => handleRemovePayment(payment.id)}
                                                                disabled={isSubmitting}
                                                                title="Cancel payment"
                                                                style={{ width: '28px', height: '28px' }}
                                                            >
                                                                <i className="bi bi-x"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-link text-danger p-0"
                                                            onClick={() => handleRemovePayment(payment.id)}
                                                            disabled={isSubmitting}
                                                            title="Remove payment"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {payments.length === 0 && (
                            <div className="text-center py-3 bg-light rounded">
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    No initial payments added. Click "Add Payment" to record advance payments.
                                </small>
                            </div>
                        )}
                    </div>

                    <Alert variant="info" className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        <small>
                            Renewing this lease will extend the lease period with the new terms specified above.
                            Initial payments are optional and can be added later.
                        </small>
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <button 
                        type="button"
                        className="odoo-btn odoo-btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="odoo-btn odoo-btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Renewing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Renew Lease
                            </>
                        )}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default RenewLeaseModal;
