/**
 * LeaseDetailsTab Component
 * Displays lease information and financial summary
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LeasePropType } from '../../../shared/types/propTypes';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'TSh 0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'TSh 0';
  return `TSh ${numAmount.toLocaleString()}`;
};

const getUnitInfo = (lease) => {
  if (lease.unit_number) return lease.unit_number;
  if (lease.unit_name) return lease.unit_name;
  if (lease.unit?.unit_name) return lease.unit.unit_name;
  if (lease.unit?.unit_number) return lease.unit.unit_number;
  return 'Unknown Unit';
};

const getPropertyAddress = (lease) => {
  if (lease.property?.address) {
    const { street, region_name, district_name, ward_name } = lease.property.address;
    return `${street || ''}, ${region_name || ''} ${district_name || ''}, ${ward_name || ''}`;
  }
  return 'N/A';
};

const LeaseDetailsTab = ({ lease }) => {
  return (
    <div className="lease-form-compact">
      {/* General Information Fields */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="compact-form-row">
            <label className="compact-inline-label">Tenant:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={`${lease.tenant?.first_name || 'N/A'} ${lease.tenant?.last_name || ''}`}
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">Property Name:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={lease.property?.property_name || 'N/A'} 
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">Unit Number:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={getUnitInfo(lease)} 
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">Start Date:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={lease.start_date} 
              readOnly 
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="compact-form-row">
            <label className="compact-inline-label">Phone Number:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={lease.tenant?.username || 'N/A'} 
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">Property Location:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={getPropertyAddress(lease)} 
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">End Date:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={lease.end_date} 
              readOnly 
            />
          </div>
          <div className="compact-form-row">
            <label className="compact-inline-label">Lease Duration:</label>
            <input 
              type="text" 
              className="underline-input" 
              value={`${lease.number_of_month || 'N/A'} months`} 
              readOnly 
            />
          </div>
        </div>
      </div>

      {/* Financial Summary - Bottom Right */}
      <div className="row mt-4">
        <div className="col-md-8">
          {/* Original Lease Reference */}
          {lease.original_lease && (
            <div className="bg-light p-3 rounded">
              <h6 className="mb-3">
                <i className="bi bi-link-45deg me-2"></i>
                Lease History
              </h6>
              <div className="d-flex align-items-center">
                <span className="me-2"></span>
                <Link 
                  to={`/leases/${typeof lease.original_lease === 'string' ? lease.original_lease : (lease.original_lease.id || lease.original_lease.lease_id)}`}
                  className="fw-bold text-primary"
                  style={{ textDecoration: 'none' }}
                >
                  {typeof lease.original_lease === 'string' 
                    ? 'View Previous Lease' 
                    : lease.original_lease.lease_number}
                  <i className="bi bi-box-arrow-up-right ms-1"></i>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          <div className="bg-light p-3 rounded">
            <h6 className="mb-3">
              <i className="bi bi-calculator me-2"></i>
              Payments Summary
            </h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Total Amount:</span>
              <span className="fw-bold">{formatCurrency(lease.total_amount)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Paid Amount:</span>
              <span className="fw-bold text-success">{formatCurrency(lease.amount_paid || 0)}</span>
            </div>
            {lease.over_paid_amount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span>Overpaid Amount:</span>
                <span className="fw-bold text-warning">{formatCurrency(lease.over_paid_amount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span>Discount:</span>
              <span className="fw-bold text-info">{formatCurrency(lease.discount || 0)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between">
              <span className="fw-bold">Remaining:</span>
              <span className="fw-bold text-danger">{formatCurrency(lease.remaining_amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LeaseDetailsTab.propTypes = {
  lease: LeasePropType.isRequired,
};

export default LeaseDetailsTab;
