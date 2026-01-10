/**
 * TenantRow Component
 * Displays a single tenant row with edit/delete functionality
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TenantPropType } from '../../../shared/types/propTypes';

const TenantRow = ({
  tenant,
  isEditing,
  editData,
  onEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  updatingTenant,
  isMobile = false,
  hasActiveSubscription
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveEdit();
    }
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className={`tenant-card-mobile ${isEditing ? 'editing' : ''}`}>
        <div className="tenant-card-header">
          <div className="tenant-name">
            {isEditing ? (
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  name="first_name"
                  value={editData.first_name}
                  onChange={onEditChange}
                  onKeyPress={handleKeyPress}
                  disabled={updatingTenant}
                  placeholder="First name"
                  autoFocus
                />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="last_name"
                  value={editData.last_name}
                  onChange={onEditChange}
                  onKeyPress={handleKeyPress}
                  disabled={updatingTenant}
                  placeholder="Last name"
                />
              </div>
            ) : (
              <span className="fw-semibold">
                <i className="bi bi-person me-1"></i>
                {`${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'N/A'}
              </span>
            )}
          </div>
        </div>

        <div className="tenant-card-body">
          <div className="tenant-info-row">
            <span className="tenant-info-label">Username:</span>
            {isEditing ? (
              <input
                type="text"
                className="form-control form-control-sm"
                name="username"
                value={editData.username}
                onChange={onEditChange}
                onKeyPress={handleKeyPress}
                disabled={updatingTenant}
                placeholder="Username"
              />
            ) : (
              <span className="tenant-info-value">
                {tenant.username || 'N/A'}
              </span>
            )}
          </div>

          <div className="tenant-actions mt-3">
            {isEditing ? (
              <>
                <button
                  className="odoo-btn odoo-btn-success odoo-btn-sm flex-fill"
                  onClick={onSaveEdit}
                  disabled={updatingTenant}
                >
                  <i className="bi bi-check me-1"></i>
                  {updatingTenant ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm flex-fill"
                  onClick={onCancelEdit}
                  disabled={updatingTenant}
                >
                  <i className="bi bi-x me-1"></i>
                  Cancel
                </button>
              </>
            ) : (
              <div className="action-buttons">
                <button
                  className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                  onClick={onEdit}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired' : 'Edit Tenant'}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                  onClick={onDelete}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired' : 'Delete Tenant'}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <tr className={isEditing ? 'table-active' : ''}>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            name="first_name"
            value={editData.first_name}
            onChange={onEditChange}
            onKeyPress={handleKeyPress}
            disabled={updatingTenant}
            placeholder="First name"
            autoFocus
          />
        ) : (
          <span className="fw-semibold">{tenant.first_name || 'N/A'}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            name="last_name"
            value={editData.last_name}
            onChange={onEditChange}
            onKeyPress={handleKeyPress}
            disabled={updatingTenant}
            placeholder="Last name"
          />
        ) : (
          <span className="fw-semibold">{tenant.last_name || 'N/A'}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            name="username"
            value={editData.username}
            onChange={onEditChange}
            onKeyPress={handleKeyPress}
            disabled={updatingTenant}
            placeholder="Username"
          />
        ) : (
          <span>{tenant.username || 'N/A'}</span>
        )}
      </td>
      <td className="text-end">
        {isEditing ? (
          <div className="d-flex justify-content-end gap-2">
            <button
              className="odoo-btn odoo-btn-success odoo-btn-sm"
              onClick={onSaveEdit}
              disabled={updatingTenant}
            >
              <i className="bi bi-check me-1"></i>
              {updatingTenant ? 'Saving...' : 'Save'}
            </button>
            <button
              className="odoo-btn odoo-btn-secondary odoo-btn-sm"
              onClick={onCancelEdit}
              disabled={updatingTenant}
            >
              <i className="bi bi-x me-1"></i>
              Cancel
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button
              className="odoo-btn odoo-btn-outline-primary odoo-btn-sm me-1"
              onClick={onEdit}
              disabled={!hasActiveSubscription}
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to edit tenants.' : 'Edit Tenant'}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
              onClick={onDelete}
              disabled={!hasActiveSubscription}
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to delete tenants.' : 'Delete Tenant'}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

TenantRow.propTypes = {
  tenant: TenantPropType.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editData: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onEditChange: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  updatingTenant: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  hasActiveSubscription: PropTypes.bool.isRequired,
};

export default TenantRow;
