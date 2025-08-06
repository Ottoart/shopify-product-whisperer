import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAccessibility } from "@/hooks/useAccessibility";
import MobileFilterDrawer from "./MobileFilterDrawer";
import MobileFilterTrigger from "./MobileFilterTrigger";
import TouchOptimizedProductCard from "./TouchOptimizedProductCard";
import PullToRefreshIndicator from "./PullToRefreshIndicator";
import EnhancedStoreFilters from "./EnhancedStoreFilters";
import VirtualProductList from "./VirtualProductList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterState {
  search: string;
  category: string;
  brand: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  featured: boolean;
  sortBy: string;
  material: string[];
  color: string[];
  promotionType: string[];
}

interface FilterOptions {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  materials: string[];
  colors: string[];
  maxPrice: number;
}

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
}

interface ResponsiveMobileStoreProps {
  products: StoreProduct[];
  filters: FilterState;
  options: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  isInWishlist?: (productId: string) => boolean;
  isInComparison?: (productId: string) => boolean;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function ResponsiveMobileStore({
  products,
  filters,
  options,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  isInWishlist,
  isInComparison,
  onRefresh,
  isLoading = false,
  hasNextPage = false,
  onLoadMore
}: ResponsiveMobileStoreProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      announceToScreenReader("Refreshing products", "assertive");
      await onRefresh();
      announceToScreenReader("Products refreshed", "polite");
    }
  }, [onRefresh, announceToScreenReader]);

  const {
    isRefreshing,
    pullDistance,
    isAtThreshold,
    containerRef: pullRef
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile && !!onRefresh,
    threshold: 80
  });

  if (!isMobile) {
    // Desktop layout with sidebar
    return (
      <div className="flex min-h-screen bg-background">
        <EnhancedStoreFilters
          filters={filters}
          options={options}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
          activeFilterCount={activeFilterCount}
        />
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <VirtualProductList
              products={products}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onAddToCompare={onAddToCompare}
              isInWishlist={isInWishlist}
              isInComparison={isInComparison}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              onLoadMore={onLoadMore}
              height={600}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout with drawer and touch optimizations
  return (
    <div className="min-h-screen bg-background relative">
      {/* Pull to refresh indicator */}
      {onRefresh && (
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isAtThreshold={isAtThreshold}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Mobile content */}
      <div
        ref={pullRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "h-screen overflow-y-auto",
          pullDistance > 0 && "transition-transform duration-200"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`
        }}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold">Products</h1>
            <MobileFilterDrawer
              filters={filters}
              options={options}
              onFiltersChange={onFiltersChange}
              onClearFilters={onClearFilters}
              activeFilterCount={activeFilterCount}
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              trigger={
                <MobileFilterTrigger
                  activeFilterCount={activeFilterCount}
                  size="sm"
                />
              }
            />
          </div>
        </div>

        {/* Product grid with touch optimization */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <TouchOptimizedProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onAddToCompare={onAddToCompare}
                isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                isInComparison={isInComparison ? isInComparison(product.id) : false}
                viewMode="grid"
              />
            ))}
          </div>

          {/* Load more */}
          {hasNextPage && onLoadMore && (
            <div className="mt-6 text-center">
              <Button
                onClick={onLoadMore}
                disabled={isLoading}
                size="lg"
                className="w-full max-w-xs h-12 touch-manipulation"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating filter button */}
      <MobileFilterDrawer
        filters={filters}
        options={options}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        activeFilterCount={activeFilterCount}
        trigger={
          <MobileFilterTrigger
            activeFilterCount={activeFilterCount}
            isFloating={true}
          />
        }
      />
    </div>
  );
}