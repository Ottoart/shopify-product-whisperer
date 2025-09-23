import { useState, useEffect } from 'react';

interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  viewedAt: Date;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed.map((item: any) => ({
          ...item,
          viewedAt: new Date(item.viewedAt)
        })));
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
      }
    }
  }, []);

  const addToRecentlyViewed = (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.id !== product.id);
      
      // Add to beginning
      const updated = [{
        ...product,
        viewedAt: new Date()
      }, ...filtered].slice(0, 10); // Keep only last 10
      
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
};