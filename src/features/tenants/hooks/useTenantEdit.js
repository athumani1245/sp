/**
 * useTenantEdit Hook
 * Manages tenant inline editing state and operations
 */

import { useState } from 'react';
import { updateTenant } from '../../../services/tenantService';

export const useTenantEdit = (tenants, setTenants, onSuccess, onError) => {
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editTenantData, setEditTenantData] = useState({
    first_name: '',
    last_name: '',
    username: ''
  });
  const [updatingTenant, setUpdatingTenant] = useState(false);

  const handleEditTenant = (tenant) => {
    setEditingTenantId(tenant.id);
    setEditTenantData({
      first_name: tenant.first_name || '',
      last_name: tenant.last_name || '',
      username: tenant.username || ''
    });
    if (onError) onError('');
  };

  const handleEditTenantChange = (e) => {
    const { name, value } = e.target;
    setEditTenantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEditTenant = async () => {
    if (!editTenantData.first_name.trim() || !editTenantData.last_name.trim() || !editTenantData.username.trim()) {
      if (onError) onError('All fields are required');
      return;
    }

    setUpdatingTenant(true);
    if (onError) onError('');

    try {
      const result = await updateTenant(editingTenantId, editTenantData);
      
      if (result.success) {
        setTenants(prev => prev.map(tenant => 
          tenant.id === editingTenantId 
            ? { ...tenant, ...result.data }
            : tenant
        ));
        
        setEditingTenantId(null);
        setEditTenantData({
          first_name: '',
          last_name: '',
          username: ''
        });
        
        if (onSuccess) onSuccess('Tenant updated successfully!');
      } else {
        if (onError) onError(result.error || 'Failed to update tenant');
      }
    } catch (err) {
      if (onError) onError('Failed to update tenant');
    } finally {
      setUpdatingTenant(false);
    }
  };

  const handleCancelEditTenant = () => {
    setEditingTenantId(null);
    setEditTenantData({
      first_name: '',
      last_name: '',
      username: ''
    });
    if (onError) onError('');
  };

  return {
    editingTenantId,
    editTenantData,
    updatingTenant,
    handleEditTenant,
    handleEditTenantChange,
    handleSaveEditTenant,
    handleCancelEditTenant,
  };
};
