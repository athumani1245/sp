/**
 * useTenantActions Hook
 * Manages tenant edit and delete actions
 */

import { useState } from 'react';
import { updateTenant, deleteTenant } from '../../../services/tenantService';

export const useTenantActions = (tenant, refreshTenant, onDeleteSuccess) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    status: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const startEditing = () => {
    if (tenant) {
      setEditData({
        first_name: tenant.first_name || '',
        last_name: tenant.last_name || '',
        email: tenant.email || '',
        phone: tenant.phone || tenant.tenant_phone || '',
        id_number: tenant.id_number || tenant.tenant_id_number || '',
        status: tenant.status || 'active'
      });
    }
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (tenantId) => {
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateTenant(tenantId, editData);
      if (result.success) {
        setSuccess(result.message || 'Tenant updated successfully!');
        setIsEditing(false);
        if (refreshTenant) await refreshTenant();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Failed to update tenant');
      return { success: false, error: 'Failed to update tenant' };
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (tenant) {
      setEditData({
        first_name: tenant.first_name || '',
        last_name: tenant.last_name || '',
        email: tenant.email || '',
        phone: tenant.phone || tenant.tenant_phone || '',
        id_number: tenant.id_number || tenant.tenant_id_number || '',
        status: tenant.status || 'active'
      });
    }
    setError('');
    setSuccess('');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async (tenantId) => {
    setDeletingTenant(true);
    try {
      const result = await deleteTenant(tenantId);
      if (result.success) {
        if (onDeleteSuccess) onDeleteSuccess();
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete tenant');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Failed to delete tenant');
      return { success: false, error: 'Failed to delete tenant' };
    } finally {
      setDeletingTenant(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  return {
    isEditing,
    editData,
    updateLoading,
    showDeleteModal,
    deletingTenant,
    error,
    success,
    startEditing,
    handleInputChange,
    handleSave,
    handleCancel,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
  };
};
