/**
 * ProfileInfoSection Component
 * Displays/edits user profile information
 */

import React from 'react';
import PropTypes from 'prop-types';

const ProfileInfoSection = ({
  userInfo,
  isEditing,
  loading,
  onInputChange,
  onSave,
  onCancel,
  onEdit
}) => {
  return (
    <div className="profile-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          <i className="bi bi-person me-2"></i>
          Personal Information
        </h5>
        {!isEditing && (
          <button className="odoo-btn odoo-btn-primary odoo-btn-sm" onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i>
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">First Name</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={userInfo.firstName}
                onChange={onInputChange}
                disabled={loading}
              />
            ) : (
              <p className="form-control-plaintext">{userInfo.firstName || 'N/A'}</p>
            )}
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={userInfo.lastName}
                onChange={onInputChange}
                disabled={loading}
              />
            ) : (
              <p className="form-control-plaintext">{userInfo.lastName || 'N/A'}</p>
            )}
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <p className="form-control-plaintext">{userInfo.email || 'N/A'}</p>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Phone Number</label>
            <p className="form-control-plaintext">{userInfo.phone || 'N/A'}</p>
          </div>
          
          <div className="col-12">
            <label className="form-label">Address</label>
            {isEditing ? (
              <textarea
                className="form-control"
                name="address"
                rows="3"
                value={userInfo.address}
                onChange={onInputChange}
                disabled={loading}
              />
            ) : (
              <p className="form-control-plaintext">{userInfo.address || 'N/A'}</p>
            )}
          </div>
          
          {isEditing && (
            <div className="col-12">
              <div className="d-flex gap-2">
                <button
                  className="odoo-btn odoo-btn-success"
                  onClick={onSave}
                  disabled={loading}
                >
                  <i className="bi bi-check me-1"></i>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  className="odoo-btn odoo-btn-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <i className="bi bi-x me-1"></i>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileInfoSection.propTypes = {
  userInfo: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ProfileInfoSection;
