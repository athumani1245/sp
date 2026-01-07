/**
 * Custom hook for managing leases list with filtering and pagination
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce, useFilters, usePagination } from '../../../shared/hooks';
import { getLeases, getAllLeases } from '../../../services/leaseService';
import { PAGINATION, LEASE_STATUS } from '../../../config/constants';

export const useLeasesList = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize filters
  const {
    filters,
    setFilter,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    getActiveFilters,
  } = useFilters({
    search: '',
    status: '',
    propertyFilter: '',
    unitFilter: '',
    tenantFilter: '',
  });

  // Initialize pagination
  const pagination = usePagination({
    initialPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    onPageChange: (page, pageSize) => {
      fetchLeases({ page, page_size: pageSize });
    },
  });

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch leases with filters
  const fetchLeases = useCallback(async (customParams = {}) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        search: debouncedSearch,
        status: filters.status,
        property_id: filters.propertyFilter,
        unit_id: filters.unitFilter,
        tenant_id: filters.tenantFilter,
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...customParams,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });

      const result = await getLeases(params);

      if (result.success) {
        const leasesData = result.data?.items || result.data || [];
        setLeases(Array.isArray(leasesData) ? leasesData : []);
        pagination.setPaginationData(result.data?.pagination || result.pagination);
        return { success: true, data: leasesData };
      } else {
        setError(result.error || 'Failed to load leases');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'An error occurred while loading leases';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, pagination]);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchLeases();
  }, [debouncedSearch, filters.status, filters.propertyFilter, filters.unitFilter, filters.tenantFilter]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value);
    pagination.goToPage(1); // Reset to first page on filter change
  }, [setFilter, pagination]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    resetFilters();
    pagination.goToPage(1);
  }, [resetFilters, pagination]);

  const refreshLeases = useCallback(() => {
    return fetchLeases();
  }, [fetchLeases]);

  return {
    leases,
    loading,
    error,
    filters,
    setFilter: handleFilterChange,
    clearFilter,
    resetFilters: handleClearFilters,
    hasActiveFilters,
    getActiveFilters,
    pagination,
    refreshLeases,
    setError,
  };
};

export default useLeasesList;
