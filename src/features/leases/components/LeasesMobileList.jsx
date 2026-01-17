/**
 * LeasesMobileList Component
 * Mobile card view for leases
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LeasePropType } from '../../../shared/types/propTypes';

const LeasesMobileList = ({ leases, onLeaseClick, formatCurrency, getStatusBadge }) => {
  return (
    <div className="d-md-none">
      <div className="lease-list-container">
        {leases.map((lease) => (
          <div
            key={lease.id || Math.random()}
            className="lease-list-item"
            onClick={() => onLeaseClick(lease.id)}
          >
            <div className="lease-list-header">
              <div className="lease-reference-mobile">
                {lease.lease_number || 'No Reference'}
              </div>
              <span className={getStatusBadge(lease.status || 'unknown')}>
                {((lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1))}
              </span>
            </div>
            
            <div className="lease-list-body">
              <div className="lease-list-row">
                <div className="lease-list-label">
                  <i className="bi bi-person me-1"></i>Tenant
                </div>
                <div className="lease-list-value">
                  {lease.tenant && (lease.tenant.first_name || lease.tenant.last_name) 
                    ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
                    : lease.tenant?.username || 'Unknown'}
                </div>
              </div>
              
              <div className="lease-list-row">
                <div className="lease-list-label">
                  <i className="bi bi-building me-1"></i>Property
                </div>
                <div className="lease-list-value">
                  {lease.property?.property_name || "No Property"}
                </div>
              </div>
              
              <div className="lease-list-amounts">
                <div className="amount-item-list">
                  <div className="amount-label-list">Total</div>
                  <div className="amount-value-list total-amount">
                    {formatCurrency(lease.total_amount || 0)}
                  </div>
                </div>
                <div className="amount-item-list">
                  <div className="amount-label-list">Paid</div>
                  <div className="amount-value-list paid-amount">
                    {formatCurrency(lease.amount_paid || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

LeasesMobileList.propTypes = {
  leases: PropTypes.arrayOf(LeasePropType).isRequired,
  onLeaseClick: PropTypes.func.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
};

export default LeasesMobileList;
