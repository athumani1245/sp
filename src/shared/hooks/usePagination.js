import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and controls
 */
export const usePagination = (options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    onPageChange,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (onPageChange) {
        onPageChange(page, pageSize);
      }
    }
  }, [totalPages, pageSize, onPageChange]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (onPageChange) {
      onPageChange(1, newSize);
    }
  }, [onPageChange]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(0);
    setTotalPages(0);
  }, [initialPage, initialPageSize]);

  const setPaginationData = useCallback((data) => {
    if (data) {
      setTotalItems(data.total || data.count || 0);
      setTotalPages(data.total_pages || data.totalPages || Math.ceil((data.total || data.count || 0) / pageSize));
      setCurrentPage(data.current_page || data.page || currentPage);
    }
  }, [pageSize, currentPage]);

  // Calculate range display (e.g., "1-10 of 100")
  const getRangeDisplay = useCallback(() => {
    if (totalItems === 0) return '0-0 / 0';
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `${start}-${end} / ${totalItems}`;
  }, [currentPage, pageSize, totalItems]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
    setPaginationData,
    getRangeDisplay,
    hasNextPage,
    hasPrevPage,
  };
};

export default usePagination;
