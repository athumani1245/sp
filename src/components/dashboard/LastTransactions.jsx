import React from 'react';
import { format } from 'date-fns';

const LastTransactions = ({ leases, loading, error, onRetry }) => {
    // Sample transactions - replace with actual data
    const transactions = [
        {
            id: 1,
            property: '123 Maple Avenue Springfield',
            date: '12 Sep 2024, 9:29',
            amount: '$30K',
            avatar: 'M'
        },
        {
            id: 2,
            property: 'Booking 987 Villa Street',
            date: '10 Sep 2024, 8:29',
            amount: '$10K',
            avatar: 'B'
        },
        {
            id: 3,
            property: 'Apartment Booking On Garden Street',
            date: '08 Sep 2024, 7:29',
            amount: '$20K',
            avatar: 'A'
        }
    ];

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '16px' }}>Last Transactions</h6>
                    <button className="btn btn-link p-0 text-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
                        See All
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger alert-sm">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Failed to load transactions
                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={onRetry}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="d-flex align-items-center gap-3">
                                <div 
                                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: '#f0f0f0',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#666'
                                    }}
                                >
                                    {transaction.avatar}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="fw-medium text-truncate" style={{ fontSize: '14px', color: '#1a1a1a' }}>
                                        {transaction.property}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '12px' }}>
                                        {transaction.date}
                                    </div>
                                </div>
                                <div className="fw-bold text-end flex-shrink-0" style={{ fontSize: '16px', color: '#1a1a1a' }}>
                                    {transaction.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LastTransactions;
