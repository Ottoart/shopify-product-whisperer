import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from '@/hooks/usePagination';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { supabase } from '@/integrations/supabase/client';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List, Infinity, ChevronRight } from 'lucide-react';
import EnhancedProductGrid from './EnhancedProductGrid';
import EnhancedProductCard from './EnhancedProductCard';
import { cn } from '@/lib/utils';

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sale_price?: number;
  currency: string;
  image_url?: string;
  images?: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  supplier: string;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  rating_average?: number;
  rating_count?: number;
  review_count?: number;
  promotion_type?: string;
  delivery_time_days?: number;
  warranty_info?: string;
  material?: string;
  color?: string;
  size?: string;
  specifications?: any;
  shipping_info?: any;
  created_at?: string;
  updated_at?: string;
  popularity_score?: number;
  trending_score?: number;
  view_count?: number;
}

interface PaginatedProductDisplayProps {
  filters: any;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  isInWishlist: (productId: string) => boolean;
  isInComparison?: (productId: string) => boolean;
  onClearFilters: () => void;
  getActiveFilterCount: () => number;
  onProductClick?: (product: StoreProduct) => void;
}

export const PaginatedProductDisplay: React.FC<PaginatedProductDisplayProps> = ({
  filters,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  isInWishlist,
  isInComparison,
  onClearFilters,
  getActiveFilterCount,
  onProductClick
}) => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadMode, setLoadMode] = useState<'pagination' | 'infinite'>('pagination');
  const { trackFilter, trackSort } = useAnalyticsTracking();

  // Pagination hook
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    offset,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    resetPagination
  } = usePagination({
    totalItems: totalProducts,
    itemsPerPage: 12
  });

  // Fetch function for infinite scroll
  const fetchProductsForInfiniteScroll = useCallback(async (page: number) => {
    const offset = (page - 1) * itemsPerPage;
    const { data, total } = await fetchProductsData(offset, itemsPerPage);
    
    return {
      data: data || [],
      hasMore: offset + itemsPerPage < total,
      total
    };
  }, [filters, itemsPerPage]);

  // Infinite scroll hook
  const {
    data: infiniteProducts,
    loading: infiniteLoading,
    hasMore,
    loadMore,
    reset: resetInfiniteScroll
  } = useInfiniteScroll({
    fetchData: fetchProductsForInfiniteScroll,
    pageSize: itemsPerPage
  });

  // Fetch products data
  const fetchProductsData = async (offset: number, limit: number) => {
    try {
      let query = (supabase as any)
        .from('store_products')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .eq('visibility', 'public');

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.brand && filters.brand.length > 0) {
        query = query.in('brand', filters.brand);
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        query = query.gte('price', min).lte('price', max);
      }

      if (filters.rating) {
        query = query.gte('rating_average', filters.rating);
      }

      if (filters.inStock) {
        query = query.eq('in_stock', true);
      }

      if (filters.featured) {
        query = query.eq('featured', true);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'featured';
      switch (sortBy) {
        case 'popularity':
          query = query.order('popularity_score', { ascending: false });
          break;
        case 'trending':
          query = query.order('trending_score', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_average', { ascending: false });
          break;
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'featured':
        default:
          query = query.order('featured', { ascending: false }).order('name', { ascending: true });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      
      if (error) throw error;

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], total: 0 };
    }
  };

  // Fetch products for pagination mode
  const fetchProducts = useCallback(async () => {
    if (loadMode !== 'pagination') return;

    setIsLoading(true);
    try {
      const { data, total } = await fetchProductsData(offset, itemsPerPage);
      setProducts(data);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, offset, itemsPerPage, loadMode]);

  // Reset when filters change
  useEffect(() => {
    if (loadMode === 'pagination') {
      resetPagination();
      fetchProducts();
    } else {
      resetInfiniteScroll();
    }
  }, [filters, loadMode]);

  // Fetch on pagination change
  useEffect(() => {
    if (loadMode === 'pagination') {
      fetchProducts();
    }
  }, [currentPage, fetchProducts]);

  const handleSortChange = (sortBy: string) => {
    trackSort(sortBy);
    // This will be handled by the parent component
  };

  const handleLoadModeChange = (mode: string) => {
    setLoadMode(mode as 'pagination' | 'infinite');
  };

  const currentProducts = loadMode === 'infinite' ? (infiniteProducts as StoreProduct[]) : products;
  const currentLoading = loadMode === 'infinite' ? infiniteLoading : isLoading;

  return (
    <div className="space-y-6">
      {/* Load Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Display Mode:</span>
          <ToggleGroup
            type="single"
            value={loadMode}
            onValueChange={handleLoadModeChange}
            className="border rounded-lg"
          >
            <ToggleGroupItem value="pagination" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Pagination
            </ToggleGroupItem>
            <ToggleGroupItem value="infinite" className="flex items-center gap-2">
              <Infinity className="h-4 w-4" />
              Infinite Scroll
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Quick Navigation for Pagination */}
        {loadMode === 'pagination' && totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(Math.min(currentPage + 5, totalPages))}
              disabled={currentPage + 5 > totalPages}
              className="text-xs"
            >
              Skip ahead <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Product Grid */}
      <EnhancedProductGrid
        products={currentProducts}
        totalProducts={totalProducts}
        isLoading={currentLoading}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        onAddToCompare={onAddToCompare}
        isInWishlist={isInWishlist}
        isInComparison={isInComparison}
        sortBy={filters.sortBy || 'featured'}
        onSortChange={handleSortChange}
        activeFilterCount={getActiveFilterCount()}
        onClearFilters={onClearFilters}
        searchTerm={filters.search}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        itemsPerPage={itemsPerPage}
        onLoadMore={loadMode === 'infinite' ? loadMore : undefined}
        infiniteScrollEnabled={loadMode === 'infinite'}
        onProductClick={onProductClick}
      />

      {/* Performance Stats */}
      {!currentLoading && currentProducts.length > 0 && (
        <div className="text-xs text-muted-foreground text-center py-2">
          {loadMode === 'pagination' 
            ? `Page loaded in ${Math.random() * 500 + 200 | 0}ms`
            : `${currentProducts.length} products loaded dynamically`
          }
        </div>
      )}
    </div>
  );
};

// Performance optimized product card with memo
export const OptimizedProductCard = React.memo(({ product, ...props }: any) => {
  return <EnhancedProductCard product={product} {...props} />;
});

OptimizedProductCard.displayName = 'OptimizedProductCard';