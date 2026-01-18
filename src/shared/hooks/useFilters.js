import { useState, useCallback } from 'react';

/**
 * Custom hook for managing filter state
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Filter state and controls
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update active filter count whenever filters change
  const updateActiveCount = useCallback((filterObj) => {
    const count = Object.values(filterObj).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    setActiveFilterCount(count);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      updateActiveCount(updated);
      return updated;
    });
  }, [updateActiveCount]);

  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      updateActiveCount(updated);
      return updated;
    });
  }, [updateActiveCount]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setActiveFilterCount(0);
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: initialFilters[key] || '' };
      updateActiveCount(updated);
      return updated;
    });
  }, [initialFilters, updateActiveCount]);

  const hasActiveFilters = activeFilterCount > 0;

  const getActiveFilters = useCallback(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }, [filters]);

  return {
    filters,
    setFilter,
    setMultipleFilters,
    resetFilters,
    clearFilter,
    activeFilterCount,
    hasActiveFilters,
    getActiveFilters,
  };
};

export default useFilters;
