import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye, 
  Share2, 
  MoreHorizontal,
  Truck,
  Shield,
  Zap,
  Clock,
  Package,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface TouchOptimizedProductCardProps {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  onQuickView?: (product: StoreProduct) => void;
  onShare?: (product: StoreProduct) => void;
  isInWishlist?: boolean;
  isInComparison?: boolean;
  viewMode?: "grid" | "list";
  className?: string;
}

export default function TouchOptimizedProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  onAddToCompare,
  onQuickView,
  onShare,
  isInWishlist = false,
  isInComparison = false,
  viewMode = "grid",
  className
}: TouchOptimizedProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Touch interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsPressed(true);
    
    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If touch moved more than 10px, don't trigger click
    if (distance > 10) return;
    
    // Handle tap action
    onQuickView?.(product);
  };

  const handleTouchMove = () => {
    setIsPressed(false);
  };

  // Long press for context menu
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout;
    
    const startLongPress = () => {
      longPressTimer = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]);
        }
        // Show context menu or additional options
      }, 500);
    };
    
    const cancelLongPress = () => {
      clearTimeout(longPressTimer);
    };
    
    const element = cardRef.current;
    if (element) {
      element.addEventListener('touchstart', startLongPress);
      element.addEventListener('touchend', cancelLongPress);
      element.addEventListener('touchmove', cancelLongPress);
      
      return () => {
        element.removeEventListener('touchstart', startLongPress);
        element.removeEventListener('touchend', cancelLongPress);
        element.removeEventListener('touchmove', cancelLongPress);
      };
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD'
    }).format(price);
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.compare_at_price && product.compare_at_price > currentPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_at_price! - currentPrice) / product.compare_at_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([25, 50, 25]);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  if (viewMode === "list") {
    return (
      <Card 
        ref={cardRef}
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation",
          isPressed && "scale-[0.98] shadow-lg",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="absolute top-1 left-1 flex flex-col gap-1">
                {product.featured && (
                  <Badge variant="default" className="text-xs h-5">
                    Featured
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs h-5">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {product.brand}
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 touch-manipulation"
                    onClick={handleWishlistToggle}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isInWishlist && "fill-red-500 text-red-500"
                      )} 
                    />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 touch-manipulation">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onQuickView?.(product)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Quick View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddToCompare?.(product)}>
                        <Star className="h-4 w-4 mr-2" />
                        {isInComparison ? "Remove from Compare" : "Add to Compare"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onShare?.(product)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Rating */}
              {product.rating_average && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(product.rating_average!) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating_average.toFixed(1)} ({product.rating_count})
                  </span>
                </div>
              )}

              {/* Price and Add to Cart */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price!)}
                    </span>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="h-8 px-3 touch-manipulation"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {product.in_stock ? "Add" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation",
        isPressed && "scale-[0.98] shadow-lg",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Overlay Actions - Touch Optimized */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 touch-manipulation shadow-lg"
                onClick={handleWishlistToggle}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isInWishlist && "fill-red-500 text-red-500"
                  )} 
                />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 touch-manipulation shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView?.(product);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge variant="default" className="h-6 text-xs shadow-sm">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="h-6 text-xs shadow-sm">
                <Zap className="h-3 w-3 mr-1" />
                -{discountPercentage}%
              </Badge>
            )}
            {!product.in_stock && (
              <Badge variant="secondary" className="h-6 text-xs shadow-sm">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Add Button - Touch Optimized */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="w-full h-12 touch-manipulation shadow-lg"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.in_stock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {product.brand}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation ml-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddToCompare?.(product)}>
                  <Star className="h-4 w-4 mr-2" />
                  {isInComparison ? "Remove from Compare" : "Add to Compare"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onShare?.(product)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating */}
          {product.rating_average && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.rating_average!) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating_average.toFixed(1)} ({product.rating_count})
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            {product.delivery_time_days && (
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                <span>{product.delivery_time_days} days</span>
              </div>
            )}
            {product.warranty_info && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Warranty</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}