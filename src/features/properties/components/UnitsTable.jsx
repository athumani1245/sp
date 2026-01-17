/**
 * UnitsTable Component
 * Displays property units in a table format with inline editing
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UnitPropType } from '../../../shared/types/propTypes';
import UnitRow from './UnitRow';
import AddUnitRow from './AddUnitRow';

const UnitsTable = ({
  units,
  loading,
  isAddingUnit,
  editingUnitId,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAddUnit,
  onCancelAdd,
  onSaveAdd,
  hasActiveSubscription,
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive d-none d-md-block">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Unit Name</th>
            <th>Monthly Rent</th>
            <th>Status</th>
            <th style={{ width: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <UnitRow
              key={unit.id}
              unit={unit}
              isEditing={editingUnitId === unit.id}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              hasActiveSubscription={hasActiveSubscription}
            />
          ))}

          {isAddingUnit && (
            <AddUnitRow
              onSave={onSaveAdd}
              onCancel={onCancelAdd}
              hasActiveSubscription={hasActiveSubscription}
            />
          )}
        </tbody>
      </table>

      {!loading && units.length === 0 && !isAddingUnit && (
        <div className="text-center py-5">
          <i className="bi bi-door-open display-3 text-muted d-block mb-3"></i>
          <h5 className="text-muted">No Units Added Yet</h5>
          <p className="text-muted mb-0">Get started by adding your first unit to this property.</p>
        </div>
      )}
    </div>
  );
};

UnitsTable.propTypes = {
  units: PropTypes.arrayOf(UnitPropType).isRequired,
  loading: PropTypes.bool,
  isAddingUnit: PropTypes.bool,
  editingUnitId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddUnit: PropTypes.func.isRequired,
  onCancelAdd: PropTypes.func.isRequired,
  onSaveAdd: PropTypes.func.isRequired,
  hasActiveSubscription: PropTypes.bool.isRequired,
};

UnitsTable.defaultProps = {
  loading: false,
  isAddingUnit: false,
  editingUnitId: null,
};

export default UnitsTable;
