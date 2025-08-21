import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

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
  const session = useSession();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecentlyViewed();
    } else {
      setRecentlyViewed([]);
    }
  }, [session?.user?.id]);

  const fetchRecentlyViewed = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      // First get recently viewed product IDs
      const { data: recentlyViewedIds, error: recentError } = await supabase
        .from('recently_viewed')
        .select('id, product_id, viewed_at')
        .eq('user_id', session.user.id)
        .order('viewed_at', { ascending: false });

      if (recentError) throw recentError;

      if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
        setRecentlyViewed([]);
        return;
      }

      // Then get the product details
      const productIds = recentlyViewedIds.map(item => item.product_id);
      const { data: products, error } = await supabase
        .from('store_products')
        .select('id, name, price, sale_price, image_url, in_stock, currency, rating_average, rating_count')
        .in('id', productIds);

      if (error) throw error;

      // Combine the data
      const combinedData = recentlyViewedIds.map(recentItem => {
        const product = products?.find(p => p.id === recentItem.product_id);
        return {
          ...recentItem,
          product: product!
        };
      }).filter(item => products?.some(p => p.id === item.product_id)) as RecentlyViewedProduct[];

      setRecentlyViewed(combinedData);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentlyViewed = async (productId: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('recently_viewed')
        .insert({
          user_id: session.user.id,
          product_id: productId,
          viewed_at: new Date().toISOString(),
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error;
      }

      // Refresh the list
      await fetchRecentlyViewed();
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const clearRecentlyViewed = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    isLoading,
  };
}