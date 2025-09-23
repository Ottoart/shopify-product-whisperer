import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Scale,
  X,
  Star,
  ShoppingCart,
  Heart,
  Package,
  Check,
  Minus,
  Plus,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

interface ProductComparisonProps {
  products: StoreProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  isInWishlist?: (productId: string) => boolean;
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StoreProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: StoreProduct) => void;
  onAddToWishlist?: (product: StoreProduct) => void;
  isInWishlist?: (productId: string) => boolean;
}

interface ComparisonFloatingBarProps {
  productCount: number;
  onViewComparison: () => void;
  onClearAll: () => void;
}

export function ComparisonFloatingBar({ 
  productCount, 
  onViewComparison, 
  onClearAll 
}: ComparisonFloatingBarProps) {
  if (productCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <Card className="bg-primary text-primary-foreground shadow-2xl border-0">
        <CardContent className="flex items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            <span className="font-semibold">
              {productCount} {productCount === 1 ? 'product' : 'products'} selected for comparison
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewComparison}
              className="font-semibold"
            >
              <Eye className="h-4 w-4 mr-2" />
              Compare
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-primary-foreground hover:text-primary-foreground/80"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ComparisonModal({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  onAddToWishlist,
  isInWishlist
}: ComparisonModalProps) {
  const { toast } = useToast();

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getComparisonRows = () => {
    return [
      {
        label: "Price",
        getValue: (product: StoreProduct) => {
          const displayPrice = product.sale_price || product.price;
          const hasDiscount = product.sale_price && product.sale_price < product.price;
          return (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          );
        }
      },
      {
        label: "Rating",
        getValue: (product: StoreProduct) => 
          product.rating_average ? renderStars(product.rating_average) : (
            <span className="text-muted-foreground">No rating</span>
          )
      },
      {
        label: "Brand",
        getValue: (product: StoreProduct) => product.brand || 'N/A'
      },
      {
        label: "Material",
        getValue: (product: StoreProduct) => product.material || 'N/A'
      },
      {
        label: "Color",
        getValue: (product: StoreProduct) => product.color || 'N/A'
      },
      {
        label: "Size",
        getValue: (product: StoreProduct) => product.size || 'N/A'
      },
      {
        label: "Delivery",
        getValue: (product: StoreProduct) => 
          product.delivery_time_days ? `${product.delivery_time_days} days` : 'N/A'
      },
      {
        label: "Warranty",
        getValue: (product: StoreProduct) => product.warranty_info || 'N/A'
      },
      {
        label: "Stock Status",
        getValue: (product: StoreProduct) => (
          <Badge variant={product.in_stock ? "default" : "secondary"}>
            {product.in_stock ? "In Stock" : "Out of Stock"}
          </Badge>
        )
      }
    ];
  };

  const findBestValue = (products: StoreProduct[], getValue: (p: StoreProduct) => any, isNumeric = false) => {
    if (!isNumeric) return null;
    
    const values = products.map(p => {
      const price = p.sale_price || p.price;
      return price;
    });
    
    const minPrice = Math.min(...values);
    return values.map(v => v === minPrice);
  };

  const handleBulkAddToCart = () => {
    const inStockProducts = products.filter(p => p.in_stock);
    inStockProducts.forEach(product => onAddToCart(product));
    
    toast({
      title: "Products Added",
      description: `${inStockProducts.length} products added to cart`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Product Comparison ({products.length} products)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="space-y-6">
            {/* Product Headers */}
            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div className="font-semibold text-lg">Products</div>
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => onRemoveProduct(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <CardContent className="p-4">
                    <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.in_stock}
                        size="sm"
                        className="w-full"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                      
                      {onAddToWishlist && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddToWishlist(product)}
                          className={`w-full ${
                            isInWishlist?.(product.id) ? "text-red-500" : ""
                          }`}
                        >
                          <Heart className={`h-3 w-3 mr-1 ${
                            isInWishlist?.(product.id) ? "fill-current" : ""
                          }`} />
                          {isInWishlist?.(product.id) ? "In Wishlist" : "Add to Wishlist"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Comparison Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Feature</TableHead>
                  {products.map((product) => (
                    <TableHead key={product.id} className="text-center">
                      {product.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getComparisonRows().map((row, index) => {
                  const bestValues = row.label === "Price" 
                    ? findBestValue(products, row.getValue, true)
                    : null;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {products.map((product, productIndex) => (
                        <TableCell 
                          key={product.id} 
                          className={`text-center ${
                            bestValues?.[productIndex] ? 'bg-green-50 font-semibold' : ''
                          }`}
                        >
                          {typeof row.getValue(product) === 'string' ? (
                            <span>{row.getValue(product)}</span>
                          ) : (
                            row.getValue(product)
                          )}
                          {bestValues?.[productIndex] && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Best Price
                            </Badge>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Compare up to 4 products to find the best option for your needs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleBulkAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add All to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductComparison({
  products,
  onRemoveProduct,
  onAddToCart,
  onAddToWishlist,
  isInWishlist
}: ProductComparisonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clearAll = () => {
    products.forEach(product => onRemoveProduct(product.id));
  };

  return (
    <>
      <ComparisonFloatingBar
        productCount={products.length}
        onViewComparison={() => setIsModalOpen(true)}
        onClearAll={clearAll}
      />
      
      <ComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onRemoveProduct={onRemoveProduct}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        isInWishlist={isInWishlist}
      />
    </>
  );
}