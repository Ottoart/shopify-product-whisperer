import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Grid3X3, Package, ArrowUpDown, Filter, Eye } from "lucide-react";
import EnhancedProductCard from "./EnhancedProductCard";

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
  onClearFilters
}: EnhancedProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid-4');

  const getGridClasses = () => {
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
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-9 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className={getGridClasses()}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="prep-fox-card p-0">
              <div className="aspect-square bg-muted animate-pulse rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-10 bg-muted animate-pulse rounded" />
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
              {products.length.toLocaleString()} {products.length === 1 ? 'Product' : 'Products'}
            </p>
            <p className="text-sm text-muted-foreground">
              {products.length !== totalProducts && (
                <>of {totalProducts.toLocaleString()} total • </>
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
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
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
      ) : (
        /* No Results */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn't find any products matching your search criteria. 
            Try adjusting your filters or search terms.
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
            Showing {products.length} of {totalProducts} products
            {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}