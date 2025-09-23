import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
  refreshingThreshold?: number;
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  isAtThreshold: boolean;
  containerRef: React.RefObject<HTMLElement>;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 0.5,
  enabled = true,
  refreshingThreshold = 60
}: UsePullToRefreshOptions): UsePullToRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isAtThreshold, setIsAtThreshold] = useState(false);
  
  const containerRef = useRef<HTMLElement>(null);
  const touchStartY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isScrolledToTop = useRef<boolean>(true);
  const isDragging = useRef<boolean>(false);

  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return;
    isScrolledToTop.current = containerRef.current.scrollTop === 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    checkScrollPosition();
    if (!isScrolledToTop.current) return;
    
    touchStartY.current = e.touches[0].clientY;
    currentY.current = touchStartY.current;
    isDragging.current = false;
  }, [enabled, isRefreshing, checkScrollPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing || !isScrolledToTop.current) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - touchStartY.current;
    
    if (deltaY > 0) {
      isDragging.current = true;
      
      // Apply resistance
      const distance = Math.pow(deltaY * resistance, 0.8);
      setPullDistance(distance);
      setIsAtThreshold(distance >= threshold);
      
      // Prevent default scrolling when pulling down
      if (distance > 10) {
        e.preventDefault();
      }
      
      // Add haptic feedback when reaching threshold
      if (distance >= threshold && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }, [enabled, isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || !isDragging.current) {
      setPullDistance(0);
      setIsAtThreshold(false);
      return;
    }
    
    const shouldRefresh = pullDistance >= threshold;
    
    if (shouldRefresh) {
      setIsRefreshing(true);
      setPullDistance(refreshingThreshold);
      
      // Haptic feedback for refresh trigger
      if (navigator.vibrate) {
        navigator.vibrate([25, 50, 25]);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsAtThreshold(false);
      }
    } else {
      // Animate back to 0
      const animateBack = () => {
        setPullDistance(prev => {
          const newDistance = prev * 0.8;
          if (newDistance < 1) {
            setIsAtThreshold(false);
            return 0;
          }
          requestAnimationFrame(animateBack);
          return newDistance;
        });
      };
      animateBack();
    }
    
    isDragging.current = false;
  }, [enabled, isRefreshing, pullDistance, threshold, refreshingThreshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('scroll', checkScrollPosition, { passive: true });

    // Initial scroll position check
    checkScrollPosition();

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, checkScrollPosition]);

  return {
    isRefreshing,
    pullDistance,
    isAtThreshold,
    containerRef
  };
};