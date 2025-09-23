import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  defaultPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  resetPagination: () => void;
}

export const usePagination = ({
  totalItems,
  itemsPerPage = 12,
  defaultPage = 1
}: UsePaginationProps): UsePaginationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get page from URL or use default
  const urlPage = parseInt(searchParams.get('page') || '1');
  const [currentPage, setCurrentPage] = useState(Math.max(1, urlPage || defaultPage));

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (validPage === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', validPage.toString());
    }
    setSearchParams(newSearchParams);
  }, [totalPages, searchParams, setSearchParams]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, hasNextPage, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, hasPreviousPage, goToPage]);

  const resetPagination = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  return useMemo(() => ({
    currentPage,
    totalPages,
    itemsPerPage,
    offset,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    resetPagination
  }), [
    currentPage,
    totalPages,
    itemsPerPage,
    offset,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    resetPagination
  ]);
};