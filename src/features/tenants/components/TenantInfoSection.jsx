/**
 * TenantInfoSection Component
 * Displays/edits tenant information
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TenantPropType } from '../../../shared/types/propTypes';

const TenantInfoSection = ({
  tenant,
  isEditing,
  editData,
  onInputChange,
  onSave,
  onCancel,
  onEdit,
  updateLoading
}) => {
  if (!isEditing) {
    return (
      <div className="property-form">
        <div className="form-section">
          <div className="section-header">
            <h5>
              <i className="bi bi-person-badge me-2"></i>
              Personal Information
            </h5>
            <button
              className="odoo-btn odoo-btn-primary odoo-btn-sm"
              onClick={onEdit}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>
          </div>
          
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">First Name</label>
                <div className="form-value">{tenant.first_name || 'N/A'}</div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">Last Name</label>
                <div className="form-value">{tenant.last_name || 'N/A'}</div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">Email</label>
                <div className="form-value">{tenant.email || 'N/A'}</div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">Phone</label>
                <div className="form-value">{tenant.phone || tenant.tenant_phone || tenant.username || 'N/A'}</div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">ID Number</label>
                <div className="form-value">{tenant.id_number || tenant.tenant_id_number || 'N/A'}</div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-field-display">
                <label className="form-label">Status</label>
                <div className="form-value">
                  <span className={`badge bg-${tenant.status === 'active' ? 'success' : 'secondary'}`}>
                    {(tenant.status || 'active').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-form">
      <div className="form-section">
        <div className="section-header">
          <h5>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Personal Information
          </h5>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                name="first_name"
                value={editData.first_name}
                onChange={onInputChange}
                required
                disabled={updateLoading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                name="last_name"
                value={editData.last_name}
                onChange={onInputChange}
                required
                disabled={updateLoading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={editData.email}
                onChange={onInputChange}
                disabled={updateLoading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Phone *</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={editData.phone}
                onChange={onInputChange}
                required
                disabled={updateLoading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">ID Number</label>
              <input
                type="text"
                className="form-control"
                name="id_number"
                value={editData.id_number}
                onChange={onInputChange}
                disabled={updateLoading}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={editData.status}
                onChange={onInputChange}
                disabled={updateLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="col-12">
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="odoo-btn odoo-btn-success"
                  disabled={updateLoading}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="odoo-btn odoo-btn-secondary"
                  onClick={onCancel}
                  disabled={updateLoading}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

TenantInfoSection.propTypes = {
  tenant: TenantPropType.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editData: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    id_number: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  updateLoading: PropTypes.bool.isRequired,
};

export default TenantInfoSection;
