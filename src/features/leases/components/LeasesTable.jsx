/**
 * LeasesTable Component
 * Desktop table view for leases
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LeasePropType } from '../../../shared/types/propTypes';

const LeasesTable = ({ leases, onLeaseClick, formatCurrency, getStatusBadge }) => {
  const getUnitInfo = (lease) => {
    if (lease.unit_number) {
      return `Unit ${lease.unit_number}`;
    } else if (lease.unit_name) {
      return lease.unit_name;
    } else if (lease.unit?.unit_name) {
      return lease.unit.unit_name;
    } else if (lease.unit?.unit_number) {
      return `Unit ${lease.unit.unit_number}`;
    }
    return 'Unknown Unit';
  };

  return (
    <div className="table-responsive d-none d-md-block">
      <table className="table table-hover align-middle mb-0 leases-table">
        <thead className="table-light">
          <tr>
            <th style={{ width: '20%' }}>Reference</th>
            <th style={{ width: '20%' }}>Property & Unit</th>
            <th style={{ width: '20%' }}>Lease Period</th>
            <th style={{ width: '15%' }}>Total Amount</th>
            <th style={{ width: '13%' }}>Paid Amount</th>
            <th style={{ width: '12%' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease) => (
            <tr
              key={lease.id || Math.random()}
              onClick={() => onLeaseClick(lease.id)}
              style={{ cursor: "pointer" }}
              className="table-row-hover"
            >
              <td>
                <div className="tenant-info">
                  <span className="tenant-name">
                    {lease.lease_number || 'No Reference'}
                  </span>
                  <span className="tenant-email">
                    {lease.tenant && (lease.tenant.first_name || lease.tenant.last_name) 
                      ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim()
                      : lease.tenant?.username || 'Unknown Tenant'}
                  </span>
                </div>
              </td>
              <td>
                <div className="property-info">
                  <span className="property-name">
                    {lease.property?.property_name || "No Property"}
                  </span>
                  <span className="unit-number">
                    {getUnitInfo(lease)}
                  </span>
                </div>
              </td>
              <td>
                <div className="lease-period">
                  <span className="lease-dates">
                    {lease.start_date}
                  </span>
                  <span className="lease-duration">
                    to {lease.end_date}
                  </span>
                </div>
              </td>
              <td>
                <span className="rent-amount">
                  {formatCurrency(lease.total_amount || 0)}
                </span>
              </td>
              <td>
                <span className="paid-amount">
                  {formatCurrency(lease.amount_paid || 0)}
                </span>
              </td>
              <td>
                <span className={getStatusBadge(lease.status || 'unknown')}>
                  {((lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

LeasesTable.propTypes = {
  leases: PropTypes.arrayOf(LeasePropType).isRequired,
  onLeaseClick: PropTypes.func.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired,
};

export default LeasesTable;
