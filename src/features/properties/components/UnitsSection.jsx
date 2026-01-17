/**
 * UnitsSection Component
 * Manages the units list display with add, edit, delete functionality
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TableSkeleton } from '../../../components/skeletons';
import UnitRow from './UnitRow';
import AddUnitRow from './AddUnitRow';
import { UnitPropType, PaginationPropType } from '../../../shared/types/propTypes';

const UnitsSection = ({
  units,
  unitsLoading,
  pagination,
  isAddingUnit,
  editingUnitId,
  newUnitData,
  editUnitData,
  addingUnitLoading,
  updatingUnit,
  onAddUnit,
  onCancelAddUnit,
  onNewUnitChange,
  onSaveNewUnit,
  onEditUnit,
  onCancelEditUnit,
  onEditUnitChange,
  onSaveEditUnit,
  onDeleteUnit,
  onPageChange,
  hasActiveSubscription
}) => {
  return (
    <div className="units-tab-content units-section">
      <div className="leases-filters-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3 d-flex align-items-center" style={{ fontSize: '0.95rem' }}>
              <i className="bi bi-door-open me-2" style={{ fontSize: '0.9rem' }}></i>
              Units Management
              <span className="badge bg-primary ms-3" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                {pagination?.count || units.length} Units
              </span>
            </h5>
            {(pagination && (pagination.total_pages > 1 || pagination.count > 0)) && (
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Page {pagination.current_page || 1} of {pagination.total_pages || 1} 
                ({pagination.count || units.length} total)
              </small>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            {!isAddingUnit && (
              <button 
                className="odoo-btn odoo-btn-primary add-unit-btn"
                onClick={onAddUnit}
                disabled={editingUnitId !== null || !hasActiveSubscription}
                style={{ minWidth: '90px', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                title={!hasActiveSubscription ? 'Subscription expired. Please renew to add units.' : ''}
              >
                <i className="bi bi-plus-circle me-1" style={{ fontSize: '0.75rem' }}></i>
                Add Unit
              </button>
            )}
          </div>
        </div>

        {unitsLoading && (
          <TableSkeleton rows={3} columns={5} showHeader={false} />
        )}

        {!unitsLoading && units.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-door-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h6 className="text-muted mb-3">No Units Yet</h6>
            <p className="text-muted mb-0">Get started by adding your first unit to this property.</p>
          </div>
        )}

        {!unitsLoading && units.length === 0 && isAddingUnit && (
          <AddUnitRow
            newUnitData={newUnitData}
            onNewUnitChange={onNewUnitChange}
            onSaveNewUnit={onSaveNewUnit}
            onCancelAddUnit={onCancelAddUnit}
            addingUnitLoading={addingUnitLoading}
            isEmptyState={true}
          />
        )}

        {!unitsLoading && units.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0 leases-table" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '30%', fontSize: '0.8rem', padding: '0.5rem' }}>Unit Name</th>
                    <th style={{ width: '25%', fontSize: '0.8rem', padding: '0.5rem' }}>Rent/Month</th>
                    <th style={{ width: '20%', fontSize: '0.8rem', padding: '0.5rem' }}>Status</th>
                    <th style={{ width: '25%', fontSize: '0.8rem', padding: '0.5rem' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAddingUnit && (
                    <AddUnitRow
                      newUnitData={newUnitData}
                      onNewUnitChange={onNewUnitChange}
                      onSaveNewUnit={onSaveNewUnit}
                      onCancelAddUnit={onCancelAddUnit}
                      addingUnitLoading={addingUnitLoading}
                      isEmptyState={false}
                    />
                  )}
                  
                  {units.map((unit) => (
                    <UnitRow
                      key={unit.id}
                      unit={unit}
                      isEditing={editingUnitId === unit.id}
                      editData={editUnitData}
                      onEdit={() => onEditUnit(unit)}
                      onCancelEdit={onCancelEditUnit}
                      onEditChange={onEditUnitChange}
                      onSaveEdit={onSaveEditUnit}
                      onDelete={() => onDeleteUnit(unit.id)}
                      updatingUnit={updatingUnit}
                      hasActiveSubscription={hasActiveSubscription}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none">
              <div className="unit-cards-container">
                {isAddingUnit && (
                  <AddUnitRow
                    newUnitData={newUnitData}
                    onNewUnitChange={onNewUnitChange}
                    onSaveNewUnit={onSaveNewUnit}
                    onCancelAddUnit={onCancelAddUnit}
                    addingUnitLoading={addingUnitLoading}
                    isMobile={true}
                  />
                )}

                {units.map((unit) => (
                  <UnitRow
                    key={unit.id}
                    unit={unit}
                    isEditing={editingUnitId === unit.id}
                    editData={editUnitData}
                    onEdit={() => onEditUnit(unit)}
                    onCancelEdit={onCancelEditUnit}
                    onEditChange={onEditUnitChange}
                    onSaveEdit={onSaveEditUnit}
                    onDelete={() => onDeleteUnit(unit.id)}
                    updatingUnit={updatingUnit}
                    isMobile={true}
                    hasActiveSubscription={hasActiveSubscription}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="leases-pagination-section mt-4">
                <nav aria-label="Units pagination">
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="odoo-btn odoo-btn-secondary"
                      disabled={pagination.current_page <= 1}
                      onClick={() => onPageChange(pagination.current_page - 1)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      <i className="bi bi-chevron-left me-1" style={{ fontSize: '0.75rem' }}></i>
                      Previous
                    </button>

                    <div className="pagination-info">
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Page {pagination.current_page} of {pagination.total_pages || 1}
                      </span>
                    </div>

                    <button
                      className="odoo-btn odoo-btn-secondary"
                      disabled={pagination.current_page >= pagination.total_pages}
                      onClick={() => onPageChange(pagination.current_page + 1)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      Next
                      <i className="bi bi-chevron-right ms-1" style={{ fontSize: '0.75rem' }}></i>
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

UnitsSection.propTypes = {
  units: PropTypes.arrayOf(UnitPropType).isRequired,
  unitsLoading: PropTypes.bool.isRequired,
  pagination: PaginationPropType,
  isAddingUnit: PropTypes.bool.isRequired,
  editingUnitId: PropTypes.number,
  newUnitData: PropTypes.shape({
    unit_name: PropTypes.string,
    rent_per_month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  editUnitData: PropTypes.shape({
    unit_name: PropTypes.string,
    rent_per_month: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  addingUnitLoading: PropTypes.bool.isRequired,
  updatingUnit: PropTypes.bool.isRequired,
  onAddUnit: PropTypes.func.isRequired,
  onCancelAddUnit: PropTypes.func.isRequired,
  onNewUnitChange: PropTypes.func.isRequired,
  onSaveNewUnit: PropTypes.func.isRequired,
  onEditUnit: PropTypes.func.isRequired,
  onCancelEditUnit: PropTypes.func.isRequired,
  onEditUnitChange: PropTypes.func.isRequired,
  onSaveEditUnit: PropTypes.func.isRequired,
  onDeleteUnit: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  hasActiveSubscription: PropTypes.bool.isRequired,
};

export default UnitsSection;
