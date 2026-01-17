/**
 * useTenantDetails Hook
 * Manages tenant data fetching and leases
 */

import { useState, useEffect, useCallback } from 'react';
import { getTenantById, getTenantLeases } from '../../../services/tenantService';

export const useTenantDetails = (tenantId) => {
  const [tenant, setTenant] = useState(null);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leasesLoading, setLeasesLoading] = useState(false);
  const [error, setError] = useState('');
  const [leasesError, setLeasesError] = useState('');

  const fetchTenant = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      setError('');
      const result = await getTenantById(tenantId);
      
      if (result.success) {
        setTenant(result.data);
      } else {
        setError(result.error || 'Failed to fetch tenant details');
      }
    } catch (error) {
      setError('Failed to fetch tenant details');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchTenantLeases = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLeasesLoading(true);
      setLeasesError('');
      const result = await getTenantLeases(tenantId, { limit: 10 });
      
      if (result.success) {
        setLeases(result.data || []);
      } else {
        setLeasesError(result.error || 'Failed to fetch tenant leases');
        setLeases([]);
      }
    } catch (error) {
      setLeasesError('Failed to fetch tenant leases');
      setLeases([]);
    } finally {
      setLeasesLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
    fetchTenantLeases();
  }, [fetchTenant, fetchTenantLeases]);

  return {
    tenant,
    leases,
    loading,
    leasesLoading,
    error,
    leasesError,
    refreshTenant: fetchTenant,
    refreshLeases: fetchTenantLeases,
  };
};
