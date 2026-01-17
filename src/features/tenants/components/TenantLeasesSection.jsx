/**
 * TenantLeasesSection Component
 * Displays tenant's lease history
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';
import { LeasePropType } from '../../../shared/types/propTypes';
import { ROUTES } from '../../../config/constants';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'TSh 0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'TSh 0';
  return `TSh ${numAmount.toLocaleString()}`;
};

const getStatusBadgeClass = (status) => {
  const badges = {
    active: 'bg-success',
    expired: 'bg-secondary',
    terminated: 'bg-danger',
    cancelled: 'bg-warning text-dark',
    draft: 'bg-info'
  };
  return `badge ${badges[status?.toLowerCase()] || 'bg-secondary'}`;
};

const TenantLeasesSection = ({ leases, loading, error }) => {
  return (
    <div className="property-form">
      <div className="form-section">
        <div className="section-header">
          <h5>
            <i className="bi bi-file-text me-2"></i>
            Lease History ({leases.length})
          </h5>
        </div>
        
        {loading && <TableSkeleton rows={3} columns={5} />}
        
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        {!loading && !error && leases.length === 0 && (
          <div className="text-center py-4">
            <i className="bi bi-file-text text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-2">No leases found for this tenant</p>
          </div>
        )}
        
        {!loading && !error && leases.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Lease Number</th>
                  <th>Property</th>
                  <th>Unit</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id || lease.lease_id}>
                    <td>
                      <Link 
                        to={`${ROUTES.LEASES}/${lease.id || lease.lease_id}`}
                        className="text-decoration-none fw-medium"
                      >
                        {lease.lease_number || 'N/A'}
                      </Link>
                    </td>
                    <td>{lease.property?.property_name || lease.property_name || 'N/A'}</td>
                    <td>{lease.unit?.unit_name || lease.unit_name || lease.unit_number || 'N/A'}</td>
                    <td>{lease.start_date || 'N/A'}</td>
                    <td>{lease.end_date || 'N/A'}</td>
                    <td>{formatCurrency(lease.total_amount)}</td>
                    <td>
                      <span className={getStatusBadgeClass(lease.status)}>
                        {(lease.status || 'Unknown').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`${ROUTES.LEASES}/${lease.id || lease.lease_id}`}
                        className="odoo-btn odoo-btn-primary odoo-btn-sm"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

TenantLeasesSection.propTypes = {
  leases: PropTypes.arrayOf(LeasePropType).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default TenantLeasesSection;
