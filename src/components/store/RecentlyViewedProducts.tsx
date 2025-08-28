// import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Package, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface RecentlyViewedProductsProps {
  onAddToCart: (productId: string) => void;
  showAsCard?: boolean;
  maxItems?: number;
}

export default function RecentlyViewedProducts({ 
  onAddToCart, 
  showAsCard = true,
  maxItems = 10
}: RecentlyViewedProductsProps) {
  const recentlyViewed: any[] = [];
  const clearRecentlyViewed = async () => {};
  const isLoading = false;

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
    );
  };

  const ProductCard = ({ item }: { item: any }) => {
    const { product } = item;
    const displayPrice = product.sale_price || product.price;
    const hasDiscount = product.sale_price && product.sale_price < product.price;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              Sale
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.viewed_at), 'MMM dd')}
            </span>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="space-y-2">
            <Link 
              to={`/store/product/${product.id}`}
              className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            
            {product.rating_average && product.rating_count && (
              <div className="flex items-center">
                {renderStars(product.rating_average, product.rating_count)}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <Button
                size="sm"
                onClick={() => onAddToCart(product.id)}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductSkeleton = () => (
    <Card>
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );

  const content = (
    <>
      {recentlyViewed.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {recentlyViewed.length} recently viewed items
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : recentlyViewed.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recentlyViewed.slice(0, maxItems).map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recently viewed products yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start browsing to see your recently viewed items here.
          </p>
        </div>
      )}
    </>
  );

  if (showAsCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Recently Viewed
      </h3>
      {content}
    </div>
  );
}