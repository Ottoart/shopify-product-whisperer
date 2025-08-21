import { useState } from "react";

interface RecentlyViewedProduct {
  id: string;
  product_id: string;
  viewed_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    image_url?: string;
    in_stock: boolean;
    currency: string;
    rating_average?: number;
    rating_count?: number;
  };
}

interface UseRecentlyViewedReturn {
  recentlyViewed: RecentlyViewedProduct[];
  addToRecentlyViewed: (productId: string) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
  isLoading: boolean;
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  // Mock implementation - ProductWhisper system removed
  const [recentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [isLoading] = useState(false);

  const addToRecentlyViewed = async (productId: string) => {
    console.log('Recently viewed system removed - ProductWhisper tables deleted');
  };

  const clearRecentlyViewed = async () => {
    console.log('Recently viewed system removed - ProductWhisper tables deleted');
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    isLoading,
  };
}