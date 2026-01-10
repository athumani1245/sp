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
        page: customParams.page || pagination.currentPage,
        limit: customParams.limit || pagination.pageSize,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });

      const result = await getLeases(params);

      if (result.success) {
        setLeases(result.data || []);
        
        // Set pagination data from the response
        if (result.pagination) {
          pagination.setPaginationData(result.pagination);
        }
        
        return { success: true, data: result.data };
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
  }, [debouncedSearch, filters.status, filters.propertyFilter, filters.unitFilter, filters.tenantFilter]);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    pagination.goToPage(1); // Reset to page 1 on filter change
    fetchLeases({ page: 1 });
  }, [debouncedSearch, filters.status, filters.propertyFilter, filters.unitFilter, filters.tenantFilter]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    pagination.goToPage(page);
    fetchLeases({ page });
  }, [pagination.goToPage, fetchLeases]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value);
  }, [setFilter]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const refreshLeases = useCallback(() => {
    return fetchLeases();
  }, [fetchLeases]);

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    return value && value !== '';
  }).length;

  return {
    leases,
    loading,
    error,
    filters,
    handleFilterChange,
    handleClearFilters,
    setFilter: handleFilterChange,
    clearFilter,
    resetFilters: handleClearFilters,
    hasActiveFilters,
    getActiveFilters,
    activeFilterCount,
    pagination: {
      current_page: pagination.currentPage,
      page_size: pagination.pageSize,
      count: pagination.totalItems,
      total_pages: pagination.totalPages,
    },
    handlePageChange,
    refreshLeases,
    setError,
  };
};

export default useLeasesList;
