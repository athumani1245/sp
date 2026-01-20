/**
 * AddUnitRow Component
 * Inline form for adding a new unit
 * Supports desktop table, mobile card, and empty state views
 */

import React from 'react';
import PropTypes from 'prop-types';

const AddUnitRow = ({
  newUnitData,
  onNewUnitChange,
  onSaveNewUnit,
  onCancelAddUnit,
  addingUnitLoading,
  isEmptyState = false,
  isMobile = false
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveNewUnit();
    }
  };

  // Empty State View (shown when no units exist)
  if (isEmptyState) {
    return (
      <div className="add-unit-form p-4 bg-light rounded mb-4">
        <h6 className="mb-3">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Unit
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              name="unit_name"
              value={newUnitData.unit_name}
              onChange={onNewUnitChange}
              onKeyPress={handleKeyPress}
              placeholder="Unit name *"
              disabled={addingUnitLoading}
              autoFocus
            />
          </div>
          <div className="col-md-6">
            <input
              type="number"
              className="form-control"
              name="rent_per_month"
              value={newUnitData.rent_per_month}
              onChange={onNewUnitChange}
              onKeyPress={handleKeyPress}
              placeholder="Rent per month *"
              disabled={addingUnitLoading}
            />
          </div>
          <div className="col-12">
            <div className="d-flex gap-2">
              <button 
                className="odoo-btn odoo-btn-success flex-fill"
                onClick={onSaveNewUnit}
                disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
              >
                <i className="bi bi-check me-2"></i>
                {addingUnitLoading ? 'Adding...' : 'Add Unit'}
              </button>
              <button 
                className="odoo-btn odoo-btn-secondary flex-fill"
                onClick={onCancelAddUnit}
                disabled={addingUnitLoading}
              >
                <i className="bi bi-x me-2"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="unit-card-mobile editing add-unit-card">
        <div className="unit-card-header">
          <div className="unit-name">
            <i className="bi bi-plus-circle me-1"></i>
            <span className="fw-semibold">Add New Unit</span>
          </div>
        </div>

        <div className="unit-card-body">
          <div className="mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              name="unit_name"
              value={newUnitData.unit_name}
              onChange={onNewUnitChange}
              onKeyPress={handleKeyPress}
              placeholder="Unit name *"
              disabled={addingUnitLoading}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              className="form-control form-control-sm"
              name="rent_per_month"
              value={newUnitData.rent_per_month}
              onChange={onNewUnitChange}
              onKeyPress={handleKeyPress}
              placeholder="Rent per month *"
              disabled={addingUnitLoading}
            />
          </div>

          <div className="unit-actions">
            <button
              className="odoo-btn odoo-btn-success odoo-btn-sm flex-fill"
              onClick={onSaveNewUnit}
              disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
            >
              <i className="bi bi-check me-1"></i>
              {addingUnitLoading ? 'Adding...' : 'Add'}
            </button>
            <button
              className="odoo-btn odoo-btn-secondary odoo-btn-sm flex-fill"
              onClick={onCancelAddUnit}
              disabled={addingUnitLoading}
            >
              <i className="bi bi-x me-1"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <tr className="table-active add-unit-row">
      <td>
        <input
          type="text"
          className="form-control form-control-sm"
          name="unit_name"
          value={newUnitData.unit_name}
          onChange={onNewUnitChange}
          onKeyPress={handleKeyPress}
          placeholder="Unit name *"
          disabled={addingUnitLoading}
          autoFocus
        />
      </td>
      <td>
        <input
          type="number"
          className="form-control form-control-sm"
          name="rent_per_month"
          value={newUnitData.rent_per_month}
          onChange={onNewUnitChange}
          onKeyPress={handleKeyPress}
          placeholder="Rent per month *"
          disabled={addingUnitLoading}
        />
      </td>
      <td>
        <span className="badge bg-secondary">New</span>
      </td>
      <td className="text-end">
        <div className="d-flex justify-content-end gap-2">
          <button
            className="odoo-btn odoo-btn-success odoo-btn-sm"
            onClick={onSaveNewUnit}
            disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
          >
            <i className="bi bi-check me-1"></i>
            {addingUnitLoading ? 'Adding...' : 'Add'}
          </button>
          <button
            className="odoo-btn odoo-btn-secondary odoo-btn-sm"
            onClick={onCancelAddUnit}
            disabled={addingUnitLoading}
          >
            <i className="bi bi-x me-1"></i>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

AddUnitRow.propTypes = {
  newUnitData: PropTypes.shape({
    unit_name: PropTypes.string.isRequired,
    rent_per_month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onNewUnitChange: PropTypes.func.isRequired,
  onSaveNewUnit: PropTypes.func.isRequired,
  onCancelAddUnit: PropTypes.func.isRequired,
  addingUnitLoading: PropTypes.bool.isRequired,
  isEmptyState: PropTypes.bool,
  isMobile: PropTypes.bool,
};

export default AddUnitRow;
