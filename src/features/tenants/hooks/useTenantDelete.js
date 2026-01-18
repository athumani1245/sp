/**
 * useTenantDelete Hook
 * Manages tenant deletion with confirmation modal
 */

import { useState } from 'react';
import { deleteTenant } from '../../../services/tenantService';

export const useTenantDelete = (setTenants, onSuccess, onError) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(false);

  const handleDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
  };

  const confirmDeleteTenant = async () => {
    if (!tenantToDelete) return;
    
    setDeletingTenant(true);
    try {
      const result = await deleteTenant(tenantToDelete.id);
      if (result.success) {
        setTenants(prev => prev.filter(tenant => tenant.id !== tenantToDelete.id));
        setShowDeleteModal(false);
        setTenantToDelete(null);
        if (onSuccess) onSuccess(result.message || 'Tenant deleted successfully!');
      } else {
        if (onError) onError(result.error || 'Failed to delete tenant');
      }
    } catch (error) {
      if (onError) onError('Failed to delete tenant');
    } finally {
      setDeletingTenant(false);
    }
  };

  const cancelDeleteTenant = () => {
    setShowDeleteModal(false);
    setTenantToDelete(null);
  };

  return {
    showDeleteModal,
    tenantToDelete,
    deletingTenant,
    handleDeleteTenant,
    confirmDeleteTenant,
    cancelDeleteTenant,
  };
};
