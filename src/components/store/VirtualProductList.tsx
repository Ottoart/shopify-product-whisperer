import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { cn } from "@/lib/utils";
import TouchOptimizedProductCard from "./TouchOptimizedProductCard";
import { Skeleton } from "@/components/ui/skeleton";

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

interface VirtualProductListProps {
  products: StoreProduct[];
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  onQuickView?: (product: StoreProduct) => void;
  onShare?: (product: StoreProduct) => void;
  isInWishlist?: (productId: string) => boolean;
  isInComparison?: (productId: string) => boolean;
  height?: number;
  itemsPerRow?: number;
  itemHeight?: number;
  className?: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loadMoreThreshold?: number;
}

export default function VirtualProductList({
  products,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  onQuickView,
  onShare,
  isInWishlist,
  isInComparison,
  height = 600,
  itemsPerRow = 2,
  itemHeight = 420,
  className,
  isLoading = false,
  onLoadMore,
  hasNextPage = false,
  loadMoreThreshold = 5
}: VirtualProductListProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);

  // Calculate responsive items per row
  const responsiveItemsPerRow = useMemo(() => {
    if (containerWidth < 640) return 1; // sm
    if (containerWidth < 768) return 2; // md
    if (containerWidth < 1024) return 3; // lg
    return Math.min(itemsPerRow, 4); // xl
  }, [containerWidth, itemsPerRow]);

  // Group products into rows
  const productRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < products.length; i += responsiveItemsPerRow) {
      rows.push(products.slice(i, i + responsiveItemsPerRow));
    }
    return rows;
  }, [products, responsiveItemsPerRow]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load more when scrolling near bottom
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (
      hasNextPage &&
      onLoadMore &&
      visibleStopIndex >= productRows.length - loadMoreThreshold
    ) {
      onLoadMore();
    }
  }, [hasNextPage, onLoadMore, productRows.length, loadMoreThreshold]);

  // Row renderer
  const Row = ({ index, style }: any) => {
    const rowProducts = productRows[index];
    const itemWidth = containerWidth / responsiveItemsPerRow;
    const gap = 16;
    const cardWidth = itemWidth - gap;

    return (
      <div style={style} className="px-2">
        <div className="flex gap-4 h-full">
          {rowProducts.map((product, productIndex) => (
            <div
              key={product.id}
              style={{ width: `${cardWidth}px` }}
              className="flex-shrink-0"
            >
              <TouchOptimizedProductCard
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onAddToCompare={onAddToCompare}
                onQuickView={onQuickView}
                onShare={onShare}
                isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                isInComparison={isInComparison ? isInComparison(product.id) : false}
                viewMode="grid"
                className="h-full"
              />
            </div>
          ))}
          
          {/* Fill empty slots in last row */}
          {rowProducts.length < responsiveItemsPerRow && 
            Array.from({ length: responsiveItemsPerRow - rowProducts.length }).map((_, emptyIndex) => (
              <div
                key={`empty-${emptyIndex}`}
                style={{ width: `${cardWidth}px` }}
                className="flex-shrink-0"
              />
            ))
          }
        </div>
      </div>
    );
  };

  // Loading row renderer
  const LoadingRow = ({ style }: { style: React.CSSProperties }) => {
    const itemWidth = containerWidth / responsiveItemsPerRow;
    const gap = 16;
    const cardWidth = itemWidth - gap;

    return (
      <div style={style} className="px-2">
        <div className="flex gap-4 h-full">
          {Array.from({ length: responsiveItemsPerRow }).map((_, index) => (
            <div
              key={index}
              style={{ width: `${cardWidth}px` }}
              className="flex-shrink-0"
            >
              <div className="h-full bg-card rounded-lg border p-0 overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="space-y-4">
          <div className="text-lg font-medium text-muted-foreground">
            No products found
          </div>
          <div className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ height }}
    >
      {containerWidth > 0 && (
        <>
          <List
            ref={listRef}
            height={height}
            width={containerWidth}
            itemCount={productRows.length + (isLoading ? 3 : 0)}
            itemSize={itemHeight + 16}
            onItemsRendered={handleItemsRendered}
            overscanCount={2}
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          >
            {({ index, style }) => {
              if (index >= productRows.length) {
                // Render loading skeletons
                return <LoadingRow style={style} />;
              }
              return <Row index={index} style={style} />;
            }}
          </List>

          {/* Load more indicator */}
          {isLoading && hasNextPage && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading more products...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}