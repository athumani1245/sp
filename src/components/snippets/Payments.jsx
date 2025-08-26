import React, { useState } from 'react';
import { Button, Spinner, Modal } from 'react-bootstrap';
import AddPayment from '../forms/addPayment';
import { cancelPayment } from '../../services/paymentService';

const Payments = ({ payments = [], onPaymentAdded, leaseId, refreshData }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'TSh 0';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'TSh 0';
        return `TSh ${numAmount.toLocaleString()}`;
    };

    const renderPaymentsList = () => {
        if (payments.length > 0) {
            return (
                <div>
                    {/* Desktop Table View */}
                    <div className="d-none d-md-block">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <tr key={payment.id || index}>
                                            <td>{payment.date_paid || 'N/A'}</td>
                                            <td className="fw-bold text-success">
                                                {formatCurrency(payment.amount_paid)}
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {payment.category || 'RENT'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${payment.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                                                    {payment.status || 'pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowCancelModal(true);
                                                    }}
                                                    disabled={payment.status !== 'success'}
                                                >
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    Cancel
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="d-md-none">
                        <div className="payment-cards-container">
                            {payments.map((payment, index) => (
                                <div key={payment.id || index} className="payment-card-mobile">
                                    <div className="payment-card-header">
                                        <div className="payment-date">
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {payment.date_paid}
                                        </div>
                                        <div className="payment-amount">
                                            {formatCurrency(payment.amount_paid)}
                                        </div>
                                    </div>
                                    <div className="payment-card-body">
                                        <div className="payment-card-row">
                                            <span className="payment-card-label">
                                                <i className="bi bi-tag me-1"></i>
                                                Category:
                                            </span>
                                            <span className="badge bg-secondary">
                                                {payment.category || 'RENT'}
                                            </span>
                                        </div>
                                        <div className="payment-card-row">
                                            <span className="payment-card-label">
                                                <i className="bi bi-check-circle me-1"></i>
                                                Status:
                                            </span>
                                            <span className={`badge ${payment.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                                                {payment.status || 'pending'}
                                            </span>
                                        </div>
                                        {payment.status === 'success' && (
                                            <div className="payment-card-actions">
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowCancelModal(true);
                                                    }}
                                                    className="w-100"
                                                >
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    Cancel Payment
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-5">
                <i className="bi bi-credit-card display-1 text-muted"></i>
                <h5 className="mt-3">No payments recorded</h5>
                <p className="text-muted">Payment history will appear here once payments are recorded.</p>
            </div>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5><i className="bi bi-credit-card me-2"></i>Payment History</h5>
                <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                >
                    <i className="bi bi-plus me-1"></i>
                    Record Payment
                </Button>
                
                <AddPayment
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    leaseId={leaseId}
                    onPaymentAdded={(newPayment) => {
                        setShowPaymentModal(false);
                        if (refreshData) {
                            refreshData();
                        }
                    }}
                />
            </div>
            {renderPaymentsList()}

            {/* Cancel Payment Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                        Cancel Payment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to cancel this payment? This action cannot be undone.</p>
                    {selectedPayment && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <strong>Payment Details:</strong>
                            <ul className="mt-2 mb-0">
                                <li>Amount: {formatCurrency(selectedPayment.amount_paid)}</li>
                                <li>Date: {formatDate(selectedPayment.date_paid)}</li>
                                <li>Category: {selectedPayment.category}</li>
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowCancelModal(false)}
                        disabled={isCancelling}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Close
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={() => {
                            // Add your cancel payment logic here
                            setIsCancelling(true);
                            // call a method to cancel the payment
                            cancelPayment(selectedPayment.id)
                                .then(() => {
                                    setShowCancelModal(false);
                                    refreshData();
                                })
                                .catch((error) => {
                                    console.error("Error cancelling payment:", error);
                                    setIsCancelling(false);
                                });
                        }} 
                        disabled={isCancelling}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Payments;
