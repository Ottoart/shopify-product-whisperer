import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import StoreBreadcrumb from "@/components/store/StoreBreadcrumb";
import ProductReviews from "@/components/store/ProductReviews";
import ProductRecommendations from "@/components/store/ProductRecommendations";
import {
  Star,
  ShoppingCart,
  Heart,
  Package,
  Truck,
  Award,
  Shield,
  Clock,
  ChevronLeft,
  ZoomIn,
  Check,
  AlertCircle,
  Share2,
  Scale,
  Eye
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
  created_at?: string;
  updated_at?: string;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { toast } = useToast();
  const { addToCart } = useShoppingCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [productId]);

  useEffect(() => {
    if (product && productId) {
      addToRecentlyViewed(productId);
    }
  }, [product, productId, addToRecentlyViewed]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('id', productId)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product) return;
    
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .eq('category', product.category)
        .neq('id', productId)
        .limit(4);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      await addToCart(product.id);
    }
    
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to cart`,
    });
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    await toggleWishlist(product.id);
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {rating.toFixed(1)} ({count} reviews)
        </span>
      </div>
    );
  };

  const getStockStatus = () => {
    if (!product?.in_stock) {
      return { status: 'out-of-stock', text: 'Out of Stock', color: 'bg-destructive', icon: AlertCircle };
    }
    // Simulate low stock for demo
    const isLowStock = parseInt(product.id.slice(-1)) % 3 === 0;
    if (isLowStock) {
      return { status: 'low-stock', text: 'Only 3 left in stock', color: 'bg-orange-500', icon: AlertCircle };
    }
    return { status: 'in-stock', text: 'In Stock', color: 'bg-green-500', icon: Check };
  };

  const stockStatus = getStockStatus();
  const displayPrice = product?.sale_price || product?.price || 0;
  const hasDiscount = product?.sale_price && product?.sale_price < product?.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreBreadcrumb />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StoreBreadcrumb />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/store">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreBreadcrumb currentCategory={product.category} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/store">
            <Button variant="ghost" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-muted rounded-xl overflow-hidden group">
              {product.image_url ? (
                <>
                  <img
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
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}

              {/* Promotion Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.promotion_type && (
                  <Badge className="shadow-lg">
                    {product.promotion_type}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive" className="shadow-lg">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
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

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold leading-tight mb-2">{product.name}</h1>
              
              {product.brand && (
                <p className="text-lg text-muted-foreground mb-4">
                  by <span className="font-semibold">{product.brand}</span>
                </p>
              )}

              {/* Rating */}
              {product.rating_average && product.rating_count && (
                <div className="mb-4">
                  {renderStars(product.rating_average, product.rating_count)}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-primary">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      Save {discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white ${stockStatus.color}`}>
                  <stockStatus.icon className="h-4 w-4" />
                  {stockStatus.text}
                </div>
                
                {product.delivery_time_days && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{product.delivery_time_days}-day delivery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 h-14 text-lg font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ${(displayPrice * quantity).toFixed(2)}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-14 w-14 ${isInWishlist(product.id) ? "text-red-500 border-red-200" : ""}`}
                  onClick={handleAddToWishlist}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>

                <Button variant="outline" size="icon" className="h-14 w-14">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Free Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-5 w-5 text-purple-600" />
                <span>Quality Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="font-medium">{product.supplier}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Delivery Options</h4>
                    <p className="text-muted-foreground">
                      Standard delivery: {product.delivery_time_days} business days
                    </p>
                    <p className="text-muted-foreground">
                      Express delivery: 1-2 business days (additional charges apply)
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Returns Policy</h4>
                    <p className="text-muted-foreground">
                      Free returns within 30 days of purchase. Item must be in original condition.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to review this product
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="warranty" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Warranty Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.warranty_info ? (
                      <p className="text-muted-foreground">{product.warranty_info}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        This product comes with our standard quality guarantee.
                      </p>
                    )}
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">What's Covered</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Manufacturing defects</li>
                        <li>Material quality issues</li>
                        <li>Functional problems</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-all">
                  <Link to={`/store/product/${relatedProduct.id}`}>
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                      {relatedProduct.image_url ? (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link to={`/store/product/${relatedProduct.id}`}>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-primary mt-2">
                      ${(relatedProduct.sale_price || relatedProduct.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}