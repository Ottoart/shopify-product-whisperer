import { useState, useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>;
  initialData?: T[];
  pageSize?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  observerRef: (node: HTMLElement | null) => void;
}

export const useInfiniteScroll = <T>({
  fetchData,
  initialData = [],
  pageSize = 12,
  threshold = 1.0
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  const observer = useRef<IntersectionObserver>();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(page);
      
      setData(prev => page === 1 ? result.data : [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchData, loading, hasMore, page]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  const observerRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore, threshold]);

  // Load initial data
  useEffect(() => {
    if (data.length === 0 && hasMore) {
      loadMore();
    }
  }, []);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    observerRef
  };
};