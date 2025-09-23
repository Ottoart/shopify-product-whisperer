import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Package, 
  Truck, 
  Award,
  Zap,
  Clock
} from "lucide-react";

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
}

interface ProductCardProps {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  isInWishlist = false 
}: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : i < rating 
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({count})
        </span>
      </div>
    );
  };

  const getPromotionBadge = () => {
    if (product.promotion_type) {
      const type = product.promotion_type.toLowerCase();
      if (type === 'sale') return <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>;
      if (type === 'new') return <Badge className="bg-green-500 text-white">New</Badge>;
      if (type === 'exclusive') return <Badge className="bg-purple-500 text-white">Exclusive</Badge>;
      if (type === 'limited') return <Badge className="bg-orange-500 text-white">Limited</Badge>;
    }
    if (product.featured) {
      return (
        <Badge className="bg-primary text-primary-foreground">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      );
    }
    return null;
  };

  const QuickViewContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Product Image */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Additional Images */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.slice(0, 4).map((img, index) => (
              <div key={index} className="w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
          {product.brand && (
            <p className="text-sm text-muted-foreground mb-2">by {product.brand}</p>
          )}
          
          {/* Rating */}
          {product.rating_average && product.rating_count && (
            <div className="mb-3">
              {renderStars(product.rating_average, product.rating_count)}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-primary">
              ${displayPrice.toFixed(2)} {product.currency}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                {Math.round(((product.price - displayPrice) / product.price) * 100)}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{product.description}</p>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {product.material && (
            <div>
              <span className="font-medium">Material:</span> {product.material}
            </div>
          )}
          {product.color && (
            <div>
              <span className="font-medium">Color:</span> {product.color}
            </div>
          )}
          {product.size && (
            <div>
              <span className="font-medium">Size:</span> {product.size}
            </div>
          )}
          {product.delivery_time_days && (
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span>{product.delivery_time_days} day delivery</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => onAddToCart(product)}
            disabled={!product.in_stock}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </Button>
          {onAddToWishlist && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onAddToWishlist(product)}
              className={isInWishlist ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>

        {/* Warranty */}
        {product.warranty_info && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Award className="h-4 w-4" />
            <span>{product.warranty_info}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square relative bg-muted rounded-t-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
              <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Quick View</DialogTitle>
                  </DialogHeader>
                  <QuickViewContent />
                </DialogContent>
              </Dialog>
              
              {onAddToWishlist && (
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className={`h-8 w-8 ${isInWishlist ? "text-red-500" : ""}`}
                  onClick={() => onAddToWishlist(product)}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {getPromotionBadge()}
          {!product.in_stock && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            {product.brand && (
              <p className="text-xs text-muted-foreground mt-1">by {product.brand}</p>
            )}
          </div>
        </div>
        
        {/* Rating */}
        {product.rating_average && product.rating_count && product.rating_count > 0 && (
          <div className="mt-2">
            {renderStars(product.rating_average, product.rating_count)}
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        <CardDescription className="line-clamp-2 text-xs">
          {product.description}
        </CardDescription>
        
        {/* Key Features */}
        <div className="flex flex-wrap gap-1 mt-3">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {product.delivery_time_days && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {product.delivery_time_days}d delivery
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex-col gap-3">
        {/* Price */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(((product.price - displayPrice) / product.price) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.in_stock}
          className="w-full"
          variant={product.in_stock ? "default" : "secondary"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}