/**
 * TenantsTable Component
 * Desktop table view for tenants with inline editing
 */

import React from 'react';
import PropTypes from 'prop-types';
import TenantRow from './TenantRow';
import { TenantPropType } from '../../../shared/types/propTypes';

const TenantsTable = ({
  tenants,
  editingTenantId,
  editData,
  onEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  updatingTenant,
  hasActiveSubscription
}) => {
  return (
    <div className="table-responsive d-none d-md-block">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: '30%' }}>First Name</th>
            <th style={{ width: '30%' }}>Last Name</th>
            <th style={{ width: '25%' }}>Username</th>
            <th style={{ width: '15%' }} className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <TenantRow
              key={tenant.id || Math.random()}
              tenant={tenant}
              isEditing={editingTenantId === tenant.id}
              editData={editData}
              onEdit={() => onEdit(tenant)}
              onCancelEdit={onCancelEdit}
              onEditChange={onEditChange}
              onSaveEdit={onSaveEdit}
              onDelete={() => onDelete(tenant)}
              updatingTenant={updatingTenant}
              hasActiveSubscription={hasActiveSubscription}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

TenantsTable.propTypes = {
  tenants: PropTypes.arrayOf(TenantPropType).isRequired,
  editingTenantId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
  hasActiveSubscription: PropTypes.bool.isRequired,
};

export default TenantsTable;
