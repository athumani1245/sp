/**
 * useTenantsList Hook
 * Manages tenants list with search and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce, usePagination } from '../../../shared/hooks';
import { getTenants } from '../../../services/tenantService';

export const useTenantsList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  
  const {
    currentPage,
    pageSize,
    goToPage,
    setPaginationData,
    ...paginationProps
  } = usePagination();

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: pageSize
      };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      
      const result = await getTenants(params);
      
      if (result.success) {
        setTenants(result.data?.items || []);
        setPaginationData({
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          count: result.data?.count || 0,
          next: result.data?.next,
          previous: result.data?.previous
        });
      } else {
        setError(result.error || 'Failed to fetch tenants');
        setTenants([]);
      }
    } catch (err) {
      setError('Failed to fetch tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, setPaginationData]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSearch = (value) => {
    setSearch(value);
    goToPage(1); // Reset to first page on search
  };

  const refreshTenants = () => {
    fetchTenants();
  };

  return {
    tenants,
    loading,
    error,
    search,
    handleSearch,
    pagination: { currentPage, pageSize, ...paginationProps },
    handlePageChange: goToPage,
    refreshTenants,
    setTenants, // For optimistic updates
  };
};
