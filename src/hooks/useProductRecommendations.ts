import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  currency: string;
  image_url?: string;
  category: string;
  brand?: string;
  in_stock: boolean;
  featured: boolean;
  rating_average?: number;
  rating_count?: number;
  tags: string[];
}

interface UseProductRecommendationsReturn {
  relatedProducts: StoreProduct[];
  frequentlyBoughtTogether: StoreProduct[];
  similarProducts: StoreProduct[];
  isLoading: boolean;
}

export function useProductRecommendations(
  productId: string,
  category?: string,
  brand?: string,
  tags?: string[]
): UseProductRecommendationsReturn {
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<StoreProduct[]>([]);
  const [similarProducts, setSimilarProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchRecommendations();
    }
  }, [productId, category, brand, tags]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Fetch related products by category
      if (category) {
        const { data: categoryProducts } = await supabase
          .from('store_products')
          .select('*')
          .eq('category', category)
          .eq('status', 'active')
          .eq('visibility', 'public')
          .neq('id', productId)
          .limit(8);

        setRelatedProducts(categoryProducts || []);
      }

      // Fetch similar products by brand
      if (brand) {
        const { data: brandProducts } = await supabase
          .from('store_products')
          .select('*')
          .eq('brand', brand)
          .eq('status', 'active')
          .eq('visibility', 'public')
          .neq('id', productId)
          .limit(6);

        setSimilarProducts(brandProducts || []);
      }

      // Simulate "frequently bought together" by finding products with similar tags
      if (tags && tags.length > 0) {
        const { data: taggedProducts } = await supabase
          .from('store_products')
          .select('*')
          .overlaps('tags', tags)
          .eq('status', 'active')
          .eq('visibility', 'public')
          .neq('id', productId)
          .limit(4);

        setFrequentlyBoughtTogether(taggedProducts || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    relatedProducts,
    frequentlyBoughtTogether,
    similarProducts,
    isLoading,
  };
}