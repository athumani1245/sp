/**
 * useLeaseDetails Hook
 * Manages lease data fetching and refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { getLeaseById } from '../../../services/leaseService';

export const useLeaseDetails = (leaseId) => {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaseDetails = useCallback(async () => {
    if (!leaseId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await getLeaseById(leaseId);
      
      if (result.success) {
        setLease(result.data);
      } else {
        setError(result.error || 'Failed to fetch lease details');
      }
    } catch (error) {
      setError('Failed to fetch lease details');
    } finally {
      setLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    fetchLeaseDetails();
  }, [fetchLeaseDetails]);

  return {
    lease,
    loading,
    error,
    refreshLease: fetchLeaseDetails,
  };
};
