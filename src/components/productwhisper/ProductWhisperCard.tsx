import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Zap, 
  Package, 
  DollarSign,
  Tag,
  Calendar,
  MoreHorizontal,
  Sparkles,
  BarChart3,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductWhisperItem } from '@/types/productwhisper';
import { formatDistanceToNow } from 'date-fns';
import { ProductWhisperEditor } from './ProductWhisperEditor';
import { useAIOptimizationWithLearning } from '@/hooks/useAIOptimizationWithLearning';
import { AIConnectionIndicator } from '@/components/AIConnectionIndicator';

interface ProductWhisperCardProps {
  product: ProductWhisperItem;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onProductUpdated: () => void;
  onAIOptimized?: (productId: string, optimizedData: any) => void;
}

export const ProductWhisperCard = ({ 
  product, 
  isSelected, 
  onSelect,
  onProductUpdated,
  onAIOptimized
}: ProductWhisperCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const { optimizeWithLearning, isOptimizing } = useAIOptimizationWithLearning();

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDescription = (html: string) => {
    // Strip HTML tags and truncate
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const handleAIOptimize = async () => {
    try {
      const optimizedData = await optimizeWithLearning({
        productHandle: product.handle,
        productData: {
          title: product.title,
          type: product.type,
          description: product.body_html,
          tags: product.tags,
          vendor: product.vendor,
          variant_price: product.variant_price,
          variant_compare_at_price: product.variant_compare_at_price,
          variant_sku: product.variant_sku,
          variant_barcode: product.variant_barcode,
          variant_grams: product.variant_grams
        }
      });
      
      if (onAIOptimized) {
        onAIOptimized(product.id, optimizedData);
      }
    } catch (error) {
      console.error('AI optimization failed:', error);
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-border"
            />
            <div className="flex items-center gap-2">
              {product.published ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Badge variant={product.published ? "default" : "secondary"}>
                {product.published ? "Published" : "Draft"}
              </Badge>
              <AIConnectionIndicator isOptimizing={isOptimizing} />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditorOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAIOptimize} disabled={isOptimizing}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {product.image_src && !imageError ? (
            <img
              src={product.image_src}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2" title={product.title}>
            {product.title}
          </h3>
          
          {product.body_html && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {formatDescription(product.body_html)}
            </p>
          )}
        </div>

        {/* Price and Inventory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">
              {formatPrice(product.variant_price)}
            </span>
            {product.variant_compare_at_price > product.variant_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.variant_compare_at_price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {product.variant_inventory_qty} in stock
            </span>
          </div>
        </div>

        {/* Tags and Categories */}
        <div className="space-y-2">
          {product.vendor && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {product.vendor}
              </span>
            </div>
          )}
          
          {product.tags && (
            <div className="flex flex-wrap gap-1">
              {product.tags.split(',').slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                  {tag.trim()}
                </Badge>
              ))}
              {product.tags.split(',').length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  +{product.tags.split(',').length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => setIsEditorOpen(true)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs bg-gradient-primary hover:scale-105 transition-transform"
            onClick={handleAIOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Zap className="h-3 w-3 mr-1 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                AI Optimize
              </>
            )}
          </Button>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1 pt-1 border-t">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
      
      <ProductWhisperEditor
        product={product}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onProductUpdated={onProductUpdated}
      />
    </Card>
  );
};