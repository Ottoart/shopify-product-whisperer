import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Package, 
  Truck, 
  Award,
  Clock,
  ZoomIn,
  Plus,
  Check,
  AlertCircle,
  Shield,
  Zap,
  TrendingUp,
  Scale
} from "lucide-react";
import { Link } from "react-router-dom";

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

interface EnhancedProductCardProps {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  onAddToCompare?: (product: StoreProduct) => void;
  isInWishlist?: boolean;
  isInComparison?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function EnhancedProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  onAddToCompare,
  isInWishlist = false,
  isInComparison = false,
  viewMode = 'grid'
}: EnhancedProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  // Enhanced stock status
  const getStockStatus = () => {
    if (!product.in_stock) {
      return { status: 'out-of-stock', text: 'Out of Stock', color: 'bg-destructive', icon: AlertCircle };
    }
    // Simulate low stock detection based on product id for demo
    const isLowStock = parseInt(product.id.slice(-1)) % 3 === 0;
    if (isLowStock) {
      return { status: 'low-stock', text: 'Low Stock', color: 'bg-orange-500', icon: AlertCircle };
    }
    return { status: 'in-stock', text: 'In Stock', color: 'bg-green-500', icon: Check };
  };

  const stockStatus = getStockStatus();

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 transition-colors ${
                i < Math.floor(rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : i < rating 
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1 font-medium">
          {rating.toFixed(1)} ({count})
        </span>
      </div>
    );
  };

  const getPromotionBadge = () => {
    const badges = [];
    
    if (product.promotion_type) {
      const type = product.promotion_type.toLowerCase();
      if (type === 'sale') badges.push(<Badge key="sale" className="bg-destructive text-destructive-foreground shadow-lg">Sale</Badge>);
      if (type === 'new') badges.push(<Badge key="new" className="bg-green-500 text-white shadow-lg">New</Badge>);
      if (type === 'exclusive') badges.push(<Badge key="exclusive" className="bg-purple-500 text-white shadow-lg">Exclusive</Badge>);
      if (type === 'limited') badges.push(<Badge key="limited" className="bg-orange-500 text-white shadow-lg">Limited</Badge>);
    }
    
    if (product.featured) {
      badges.push(
        <Badge key="featured" className="bg-primary text-primary-foreground shadow-lg">
          <Star className="h-3 w-3 mr-1 fill-current" />
          Featured
        </Badge>
      );
    }
    
    return badges;
  };

  const getDeliveryInfo = () => {
    if (!product.delivery_time_days) return null;
    
    const days = product.delivery_time_days;
    let deliveryText = '';
    let deliveryClass = '';
    
    if (days === 1) {
      deliveryText = 'Next Day Delivery';
      deliveryClass = 'text-green-600 bg-green-50';
    } else if (days <= 2) {
      deliveryText = '2-Day Delivery';
      deliveryClass = 'text-blue-600 bg-blue-50';
    } else if (days <= 5) {
      deliveryText = `${days}-Day Delivery`;
      deliveryClass = 'text-orange-600 bg-orange-50';
    } else {
      deliveryText = `${days}+ Days`;
      deliveryClass = 'text-muted-foreground bg-muted';
    }

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${deliveryClass}`}>
        <Truck className="h-3 w-3" />
        {deliveryText}
      </div>
    );
  };

  const EnhancedQuickView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
      {/* Enhanced Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-muted rounded-xl overflow-hidden group">
          {product.image_url ? (
            <>
              <img
                ref={imageRef}
                src={product.images?.[selectedImageIndex] || product.image_url}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isImageZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsImageZoomed(!isImageZoomed)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Image Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  selectedImageIndex === index 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-muted hover:border-muted-foreground'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Product Details */}
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-2xl font-bold leading-tight">{product.name}</h3>
            <div className="flex gap-2">
              {getPromotionBadge()}
            </div>
          </div>
          
          {product.brand && (
            <p className="text-muted-foreground mb-3">by <span className="font-medium">{product.brand}</span></p>
          )}
          
          {/* Enhanced Rating */}
          {product.rating_average && product.rating_count && (
            <div className="flex items-center gap-4 mb-4">
              {renderStars(product.rating_average, product.rating_count)}
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Bestseller
              </Badge>
            </div>
          )}

          {/* Enhanced Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-sm font-bold">
                  {discountPercentage}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Enhanced Stock Status */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${stockStatus.color}`}>
              <stockStatus.icon className="h-4 w-4" />
              {stockStatus.text}
            </div>
            {getDeliveryInfo()}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {/* Enhanced Specifications */}
        <div>
          <h4 className="font-semibold mb-3">Specifications</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.material && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.color && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-medium">{product.color}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{product.size}</span>
              </div>
            )}
            {product.warranty_info && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Warranty:</span>
                <span className="font-medium">{product.warranty_info}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => onAddToCart(product)}
            disabled={!product.in_stock}
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </Button>
          
          <TooltipProvider>
            {onAddToWishlist && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-12 w-12 ${isInWishlist ? "text-red-500 border-red-200" : ""}`}
                    onClick={() => onAddToWishlist(product)}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </TooltipContent>
              </Tooltip>
            )}
            
            {onAddToCompare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-12 w-12 ${isInComparison ? "text-blue-500 border-blue-200" : ""}`}
                    onClick={() => onAddToCompare(product)}
                  >
                    <Scale className={`h-5 w-5 ${isInComparison ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInComparison ? "Remove from Compare" : "Add to Compare"}
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            <span>Free Returns</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>Quality Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-48 relative bg-muted overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {getPromotionBadge()}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <Link 
                  to={`/store/product/${product.id}`}
                  className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>
                <div className="flex gap-2 ml-4">
                  {/* Quick actions */}
                </div>
              </div>
              
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-2">by {product.brand}</p>
              )}
              
              {product.rating_average && product.rating_count && (
                <div className="mb-3">
                  {renderStars(product.rating_average, product.rating_count)}
                </div>
              )}
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {product.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.in_stock}
                  className="px-6"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border-0 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Enhanced Product Image */}
        <div className="aspect-square relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground transition-all duration-300 group-hover:scale-110" />
            </div>
          )}
          
          {/* Enhanced Overlay with Glassmorphism */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute top-3 right-3 flex flex-col gap-2 transform transition-all duration-300">
              <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className={`h-10 w-10 backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 ${
                      isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '100ms' }}
                  >
                    <Eye className="h-4 w-4 text-white" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Quick View - {product.name}</DialogTitle>
                  </DialogHeader>
                  <EnhancedQuickView />
                </DialogContent>
              </Dialog>
              
              {onAddToWishlist && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        className={`h-10 w-10 backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 ${
                          isInWishlist ? "text-red-500" : "text-white"
                        } ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                        style={{ transitionDelay: '200ms' }}
                        onClick={() => onAddToWishlist(product)}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onAddToCompare && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        className={`h-10 w-10 backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 ${
                          isInComparison ? "text-blue-500" : "text-white"
                        } ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                        style={{ transitionDelay: '300ms' }}
                        onClick={() => onAddToCompare(product)}
                      >
                        <Scale className={`h-4 w-4 ${isInComparison ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {isInComparison ? "Remove from Compare" : "Add to Compare"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* Bottom Quick Add */}
            <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <Button
                onClick={() => onAddToCart(product)}
                disabled={!product.in_stock}
                className="w-full backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30 text-white font-semibold"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {getPromotionBadge().map((badge, index) => (
            <div key={index} className="transform transition-all duration-300 hover:scale-105">
              {badge}
            </div>
          ))}
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${stockStatus.color}`}>
            <stockStatus.icon className="h-3 w-3" />
            {stockStatus.text}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link 
              to={`/store/product/${product.id}`}
              className="block"
            >
              <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {product.name}
              </CardTitle>
            </Link>
            {product.brand && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">by {product.brand}</p>
            )}
          </div>
        </div>
        
        {/* Enhanced Rating */}
        {product.rating_average && product.rating_count && product.rating_count > 0 && (
          <div className="mt-3">
            {renderStars(product.rating_average, product.rating_count)}
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <CardDescription className="line-clamp-2 text-xs leading-relaxed">
          {product.description}
        </CardDescription>
        
        {/* Enhanced Features */}
        <div className="flex flex-wrap gap-1 mt-3">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-medium">
              {tag}
            </Badge>
          ))}
          {getDeliveryInfo()}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex-col gap-3">
        {/* Enhanced Price */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs font-bold animate-pulse">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Enhanced Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.in_stock}
          className="w-full h-11 font-semibold transition-all duration-300 hover:scale-105"
          variant={product.in_stock ? "default" : "secondary"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}