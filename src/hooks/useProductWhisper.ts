import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductWhisperItem, ProductWhisperFilters, ProductWhisperStats } from '@/types/productwhisper';
import { useToast } from '@/hooks/use-toast';

export const useProductWhisper = () => {
  console.log('🔧 useProductWhisper hook called');
  
  const { toast } = useToast();
  const [filters, setFilters] = useState<ProductWhisperFilters>({
    search: '',
    type: 'all',
    category: 'all',
    vendor: 'all',
    published: 'all',
  });

  // Fetch products with clean query
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['productwhisper-products'],
    queryFn: async (): Promise<ProductWhisperItem[]> => {
      console.log('📡 Starting product fetch...');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Auth user:', { hasUser: !!user, userId: user?.id });
      
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('Not authenticated');
      }

      console.log('🔍 Querying products for user:', user.id);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          handle,
          body_html,
          tags,
          type,
          category,
          vendor,
          published,
          variant_price,
          variant_compare_at_price,
          variant_sku,
          variant_inventory_qty,
          variant_inventory_policy,
          variant_requires_shipping,
          variant_taxable,
          variant_barcode,
          variant_grams,
          seo_title,
          seo_description,
          google_shopping_condition,
          google_shopping_gender,
          google_shopping_age_group,
          image_src,
          updated_at,
          user_id
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Products fetched successfully:', data?.length || 0, 'products');
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Compute filtered products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        product.title.toLowerCase().includes(searchLower) ||
        product.tags?.toLowerCase().includes(searchLower) ||
        product.vendor?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type !== 'all' && product.type !== filters.type) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }

    // Vendor filter
    if (filters.vendor !== 'all' && product.vendor !== filters.vendor) {
      return false;
    }

    // Published filter
    if (filters.published === 'published' && !product.published) {
      return false;
    }
    if (filters.published === 'draft' && product.published) {
      return false;
    }

    // Price filters
    if (filters.priceMin && product.variant_price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax && product.variant_price > filters.priceMax) {
      return false;
    }

    return true;
  });

  // Compute stats
  const stats: ProductWhisperStats = {
    total: products.length,
    published: products.filter(p => p.published).length,
    drafts: products.filter(p => !p.published).length,
    categories: new Set(products.map(p => p.category).filter(Boolean)).size,
    vendors: new Set(products.map(p => p.vendor).filter(Boolean)).size,
  };

  // Get unique values for filters
  const filterOptions = {
    types: [...new Set(products.map(p => p.type).filter(Boolean))].sort(),
    categories: [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    vendors: [...new Set(products.map(p => p.vendor).filter(Boolean))].sort(),
  };

  const updateFilters = useCallback((newFilters: Partial<ProductWhisperFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all', 
      vendor: 'all',
      published: 'all',
    });
  }, []);

  return {
    products: filteredProducts,
    allProducts: products,
    stats,
    filters,
    filterOptions,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    refetch,
  };
};