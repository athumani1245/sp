/**
 * TenantsMobileList Component
 * Mobile card list view for tenants
 */

import React from 'react';
import PropTypes from 'prop-types';
import TenantRow from './TenantRow';
import { TenantPropType } from '../../../shared/types/propTypes';

const TenantsMobileList = ({
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
    <div className="d-md-none">
      <div className="tenant-list-container">
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
            isMobile={true}
            hasActiveSubscription={hasActiveSubscription}
          />
        ))}
      </div>
    </div>
  );
};

TenantsMobileList.propTypes = {
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

export default TenantsMobileList;
