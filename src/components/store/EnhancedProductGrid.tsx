import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutGrid, 
  List, 
  Grid3X3, 
  Package, 
  ArrowUpDown, 
  Filter, 
  Eye,
  TrendingUp,
  Star,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";
import EnhancedProductCard from "./EnhancedProductCard";
import { SearchHighlight } from "./SearchHighlight";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

interface EnhancedProductGridProps {
  products: StoreProduct[];
  totalProducts: number;
  isLoading?: boolean;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  isInWishlist?: (productId: string) => boolean;
  isInComparison?: (productId: string) => boolean;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  searchTerm?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  itemsPerPage?: number;
  onLoadMore?: () => void;
  infiniteScrollEnabled?: boolean;
  onProductClick?: (product: StoreProduct) => void;
}

type ViewMode = 'grid-4' | 'grid-3' | 'grid-2' | 'list';

export default function EnhancedProductGrid({
  products,
  totalProducts,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  isInWishlist,
  isInComparison,
  sortBy,
  onSortChange,
  activeFilterCount,
  onClearFilters,
  searchTerm = '',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage = false,
  hasPreviousPage = false,
  itemsPerPage = 12,
  onLoadMore,
  infiniteScrollEnabled = false,
  onProductClick
}: EnhancedProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid-4');
  const [loadingMore, setLoadingMore] = useState(false);

  const getGridClasses = useCallback(() => {
    switch (viewMode) {
      case 'grid-4':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
      case 'grid-3':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'grid-2':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      case 'list':
        return 'flex flex-col gap-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  }, [viewMode]);

  const sortOptions = useMemo(() => [
    { value: 'featured', label: 'Featured', icon: Award },
    { value: 'popularity', label: 'Most Popular', icon: Eye },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' }
  ], []);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [onLoadMore, loadingMore]);

  const ViewModeButton = ({ mode, icon: Icon, tooltip }: { mode: ViewMode; icon: any; tooltip: string }) => (
    <Button
      variant={viewMode === mode ? "default" : "outline"}
      size="icon"
      onClick={() => setViewMode(mode)}
      className="h-9 w-9"
      title={tooltip}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const renderPagination = () => {
    if (infiniteScrollEnabled || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={!hasPreviousPage}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange?.(currentPage - 1)}
                className={!hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => onPageChange?.(pageNum)}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange?.(currentPage + 1)}
                className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(totalPages)}
                disabled={!hasNextPage}
                className="hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Loading Grid */}
        <div className={getGridClasses()}>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="prep-fox-card p-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-medium text-foreground">
              {totalProducts.toLocaleString()} Products
              {searchTerm && (
                <span className="text-muted-foreground">
                  {' '}for "<SearchHighlight text={searchTerm} searchTerm={searchTerm} />"
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {products.length !== totalProducts && (
                <>Showing {products.length} of {totalProducts.toLocaleString()} • </>
              )}
              {activeFilterCount > 0 && (
                <span>
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                </span>
              )}
            </p>
          </div>
          
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-3 w-3" />
              Clear Filters
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <ViewModeButton mode="grid-4" icon={LayoutGrid} tooltip="4 columns" />
            <ViewModeButton mode="grid-3" icon={Grid3X3} tooltip="3 columns" />
            <ViewModeButton mode="grid-2" icon={Package} tooltip="2 columns" />
            <ViewModeButton mode="list" icon={List} tooltip="List view" />
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length > 0 ? (
        <>
          <div className={getGridClasses()}>
            {products.map((product) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onAddToCompare={onAddToCompare}
                isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                isInComparison={isInComparison ? isInComparison(product.id) : false}
                viewMode={viewMode === 'list' ? 'list' : 'grid'}
              />
            ))}
          </div>

          {/* Load More Button for Infinite Scroll */}
          {infiniteScrollEnabled && hasNextPage && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      ) : (
        /* No Results */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchTerm 
              ? `No products match your search for "${searchTerm}"`
              : "No products match your current filters"
            }
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Results Summary */}
      {products.length > 0 && (
        <div className="text-center py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Displaying {products.length} of {totalProducts.toLocaleString()} products
            {searchTerm && ` matching "${searchTerm}"`}
            {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}