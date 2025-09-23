import { useProductRecommendations } from "@/hooks/useProductRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductRecommendationsProps {
  productId: string;
  category?: string;
  brand?: string;
  tags?: string[];
  onAddToCart: (productId: string) => void;
}

export default function ProductRecommendations({ 
  productId, 
  category, 
  brand, 
  tags,
  onAddToCart 
}: ProductRecommendationsProps) {
  const { 
    relatedProducts, 
    frequentlyBoughtTogether, 
    similarProducts, 
    isLoading 
  } = useProductRecommendations(productId, category, brand, tags);

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

  const ProductCard = ({ product, showAddToCart = true }: { product: any; showAddToCart?: boolean }) => {
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
              
              {showAddToCart && (
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product.id)}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              )}
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Frequently Bought Together Skeleton */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Related Products Skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Frequently Bought Together */}
      {frequentlyBoughtTogether.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBoughtTogether.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">More from {brand}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations */}
      {!isLoading && 
       relatedProducts.length === 0 && 
       frequentlyBoughtTogether.length === 0 && 
       similarProducts.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recommendations available at this time.</p>
        </div>
      )}
    </div>
  );
}