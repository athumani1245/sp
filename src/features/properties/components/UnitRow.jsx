/**
 * UnitRow Component
 * Displays a single unit row with edit/delete functionality
 * Supports both desktop table and mobile card views
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UnitPropType } from '../../../shared/types/propTypes';

const UnitRow = ({
  unit,
  isEditing,
  editData,
  onEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  updatingUnit,
  isMobile = false,
  hasActiveSubscription
}) => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveEdit();
    }
  };

  const getStatusBadge = (unit) => {
    if (unit.has_active_lease) {
      return <span className="badge bg-success">Occupied</span>;
    } else {
      return <span className="badge bg-secondary">Vacant</span>;
    }
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className={`unit-card-mobile ${isEditing ? 'editing' : ''}`}>
        <div className="unit-card-header">
          <div className="unit-name">
            {isEditing ? (
              <input
                type="text"
                className="form-control form-control-sm"
                name="unit_name"
                value={editData.unit_name}
                onChange={onEditChange}
                onKeyPress={handleKeyPress}
                disabled={updatingUnit}
                autoFocus
              />
            ) : (
              <span className="fw-semibold">
                <i className="bi bi-door-open me-1"></i>
                {unit.unit_name || 'N/A'}
              </span>
            )}
          </div>
          <div className="unit-status">
            {getStatusBadge(unit)}
          </div>
        </div>

        <div className="unit-card-body">
          <div className="unit-info-row">
            <span className="unit-info-label">Rent/Month:</span>
            {isEditing ? (
              <input
                type="number"
                className="form-control form-control-sm"
                name="rent_per_month"
                value={editData.rent_per_month}
                onChange={onEditChange}
                onKeyPress={handleKeyPress}
                disabled={updatingUnit}
                placeholder="0"
              />
            ) : (
              <span className="unit-info-value fw-semibold text-primary">
                {formatCurrency(unit.rent_amount_per_unit || unit.rent_per_month)}
              </span>
            )}
          </div>

          <div className="unit-actions mt-3">
            {isEditing ? (
              <>
                <button
                  className="odoo-btn odoo-btn-success odoo-btn-sm flex-fill"
                  onClick={onSaveEdit}
                  disabled={updatingUnit}
                >
                  <i className="bi bi-check me-1"></i>
                  {updatingUnit ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm flex-fill"
                  onClick={onCancelEdit}
                  disabled={updatingUnit}
                >
                  <i className="bi bi-x me-1"></i>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="odoo-btn odoo-btn-primary odoo-btn-sm flex-fill"
                  onClick={onEdit}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired' : ''}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit
                </button>
                <button
                  className="odoo-btn odoo-btn-danger odoo-btn-sm flex-fill"
                  onClick={onDelete}
                  disabled={!hasActiveSubscription}
                  title={!hasActiveSubscription ? 'Subscription expired' : ''}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <tr className={isEditing ? 'table-active' : ''}>
      <td style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            name="unit_name"
            value={editData.unit_name}
            onChange={onEditChange}
            onKeyPress={handleKeyPress}
            disabled={updatingUnit}
            autoFocus
            style={{ fontSize: '0.8rem' }}
          />
        ) : (
          <span className="fw-semibold">{unit.unit_name || 'N/A'}</span>
        )}
      </td>
      <td style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
        {isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            name="rent_per_month"
            value={editData.rent_per_month}
            onChange={onEditChange}
            onKeyPress={handleKeyPress}
            disabled={updatingUnit}
            placeholder="0"
            style={{ fontSize: '0.8rem' }}
          />
        ) : (
          <span className="text-primary fw-semibold">{formatCurrency(unit.rent_amount_per_unit || unit.rent_per_month)}</span>
        )}
      </td>
      <td style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
        <span className="badge" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', backgroundColor: unit.has_active_lease ? '#28a745' : '#6c757d' }}>
          {unit.has_active_lease ? 'Occupied' : 'Vacant'}
        </span>
      </td>
      <td className="text-end" style={{ padding: '0.5rem' }}>
        {isEditing ? (
          <div className="d-flex justify-content-end gap-1">
            <button
              className="odoo-btn odoo-btn-success odoo-btn-sm"
              onClick={onSaveEdit}
              disabled={updatingUnit}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minWidth: '60px' }}
            >
              <i className="bi bi-check me-1" style={{ fontSize: '0.7rem' }}></i>
              {updatingUnit ? 'Saving...' : 'Save'}
            </button>
            <button
              className="odoo-btn odoo-btn-secondary odoo-btn-sm"
              onClick={onCancelEdit}
              disabled={updatingUnit}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minWidth: '60px' }}
            >
              <i className="bi bi-x me-1" style={{ fontSize: '0.7rem' }}></i>
              Cancel
            </button>
          </div>
        ) : (
          <div className="d-flex justify-content-end gap-1">
            <button
              className="odoo-btn odoo-btn-primary odoo-btn-sm"
              onClick={onEdit}
              disabled={!hasActiveSubscription}
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to edit units.' : ''}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minWidth: '50px' }}
            >
              <i className="bi bi-pencil me-1" style={{ fontSize: '0.7rem' }}></i>
              Edit
            </button>
            <button
              className="odoo-btn odoo-btn-danger odoo-btn-sm"
              onClick={onDelete}
              disabled={!hasActiveSubscription}
              title={!hasActiveSubscription ? 'Subscription expired. Please renew to delete units.' : ''}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minWidth: '50px' }}
            >
              <i className="bi bi-trash me-1" style={{ fontSize: '0.7rem' }}></i>
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

UnitRow.propTypes = {
  unit: UnitPropType.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editData: PropTypes.shape({
    unit_name: PropTypes.string,
    rent_per_month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onEditChange: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  updatingUnit: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  hasActiveSubscription: PropTypes.bool.isRequired,
};

export default UnitRow;
