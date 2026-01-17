/**
 * BillingHistoryCard Component
 * Displays billing history
 */

import React from 'react';
import PropTypes from 'prop-types';

const BillingHistoryCard = ({ billingHistory }) => {
  return (
    <div style={{
      border: '1px solid #e3e6e8',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      height: '100%'
    }}>
      <h5 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Billing History</h5>

      <div className="table-responsive">
        {billingHistory.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-receipt" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
            <p style={{ fontSize: '0.85rem', marginBottom: 0 }}>No billing history available</p>
          </div>
        ) : (
          <table className="table table-sm" style={{ fontSize: '0.8rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem' }}>Date</th>
                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem' }}>Package</th>
                <th style={{ fontWeight: 600, color: '#6c757d', border: 'none', padding: '0.5rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.slice(0, 5).map((billing, index) => (
                <tr key={billing.id || index}>
                  <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8' }}>
                    {billing.payment_date || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8', fontSize: '0.75rem', color: '#6c757d' }}>
                    {billing.package_name} - {billing.plan_name || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', border: 'none', borderBottom: '1px solid #e3e6e8', fontWeight: 600, color: '#28a745', textAlign: 'right' }}>
                    TSH {parseFloat(billing.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

BillingHistoryCard.propTypes = {
  billingHistory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      payment_date: PropTypes.string,
      package_name: PropTypes.string,
      plan_name: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
};

export default BillingHistoryCard;
