import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { cn } from '@/lib/utils';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  rating_average?: number;
  rating_count?: number;
  view_count?: number;
  popularity_score?: number;
  in_stock: boolean;
  featured: boolean;
}

interface FeaturedProductsSectionProps {
  title?: string;
  layout?: 'grid' | 'carousel' | 'hero';
  filterType?: 'featured' | 'popular' | 'trending' | 'new';
  maxItems?: number;
  showViewAll?: boolean;
  onProductClick?: (product: FeaturedProduct) => void;
  onAddToCart?: (product: FeaturedProduct) => void;
  onAddToWishlist?: (product: FeaturedProduct) => void;
  className?: string;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  title,
  layout = 'grid',
  filterType = 'featured',
  maxItems = 8,
  showViewAll = true,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  className
}) => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackProductView, trackProductClick, trackCartAdd } = useAnalyticsTracking();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [filterType, maxItems]);

  const fetchFeaturedProducts = async () => {
    try {
      let query = supabase
        .from('store_products')
        .select('id, name, price, sale_price, image_url, rating_average, rating_count, view_count, popularity_score, in_stock, featured, created_at')
        .eq('status', 'active')
        .eq('visibility', 'public');

      if (filterType === 'featured') {
        query = query.eq('featured', true);
      }

      if (filterType === 'popular') {
        query = query.order('popularity_score', { ascending: false });
      } else if (filterType === 'trending') {
        query = query.order('trending_score', { ascending: false });
      } else if (filterType === 'new') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(maxItems);
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: FeaturedProduct) => {
    trackProductView(product.id);
    trackProductClick(product.id, { section: 'featured', filterType });
    onProductClick?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.stopPropagation();
    trackCartAdd(product.id, { section: 'featured', filterType });
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const getSectionTitle = () => {
    if (title) return title;
    
    switch (filterType) {
      case 'featured': return 'Featured Products';
      case 'popular': return 'Most Popular';
      case 'trending': return 'Trending Now';
      case 'new': return 'New Arrivals';
      default: return 'Featured Products';
    }
  };

  const getLayoutStyles = () => {
    switch (layout) {
      case 'carousel':
        return "flex gap-4 overflow-x-auto pb-4 scrollbar-hide";
      case 'hero':
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case 'grid':
      default:
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    }
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3 w-3",
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: FeaturedProduct }) => (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover-scale",
        layout === 'carousel' && "min-w-[200px] flex-shrink-0"
      )}
      onClick={() => handleProductClick(product)}
    >
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {product.featured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {product.sale_price && (
              <Badge variant="destructive" className="text-xs">
                Sale
              </Badge>
            )}
            {!product.in_stock && (
              <Badge variant="outline" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleAddToWishlist(e, product)}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleAddToCart(e, product)}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* View Count */}
          {product.view_count && product.view_count > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 rounded px-2 py-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{product.view_count}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h3 className="font-medium text-sm mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating_average && product.rating_count && (
            <div className="mb-2">
              {renderStars(product.rating_average, product.rating_count)}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            {product.sale_price ? (
              <>
                <span className="font-bold text-primary">
                  ${product.sale_price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className={getLayoutStyles()}>
          {Array.from({ length: maxItems }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className={cn("w-full", className)}>
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {getSectionTitle()}
        </h2>
        {showViewAll && (
          <Button variant="outline" size="sm">
            View All
          </Button>
        )}
      </div>

      {/* Products Grid/Carousel */}
      <div className={getLayoutStyles()}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};