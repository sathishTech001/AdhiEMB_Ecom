import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  size: number;
}

export function usePagination(defaultSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: defaultSize,
  });

  const onPageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const onPageSizeChange = useCallback((size: number) => {
    setPagination({ page: 0, size });
  }, []);

  return {
    ...pagination,
    onPageChange,
    onPageSizeChange,
  };
}
