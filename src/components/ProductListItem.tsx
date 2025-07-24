import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductEditDialog } from './ProductEditDialog';
import { Sparkles, Edit, Package } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductListItemProps {
  product: any;
  onUpdate: () => void;
  onOptimizeWithAI: (productId: string) => void;
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ 
  product, 
  onUpdate, 
  onOptimizeWithAI,
  isSelected,
  onSelect
}) => {
  const formatPrice = (price: number | string | null | undefined): string => {
    if (!price || price === 0) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  const formatInventory = (qty: number | null | undefined): string => {
    return qty !== null && qty !== undefined ? qty.toString() : 'N/A';
  };

  return (
    <Card className={`p-6 transition-colors ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
      <div className="flex items-start justify-between space-x-4">
        <div className="flex items-start space-x-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{product.title}</h3>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span><strong>Handle:</strong> {product.handle}</span>
              <span><strong>Price:</strong> {formatPrice(product.variant_price)}</span>
              <span><strong>Inventory:</strong> {formatInventory(product.variant_inventory_qty)}</span>
              <span><strong>SKU:</strong> {product.variant_sku || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Vendor:</span>
              <Badge variant="outline">{product.vendor}</Badge>
              {product.type && (
                <>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline">{product.type}</Badge>
                </>
              )}
              {product.status && (
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              )}
            </div>
            
            {product.tags && (
              <div className="flex flex-wrap gap-1">
                {product.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
                {product.tags.split(',').length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.tags.split(',').length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ProductEditDialog 
            product={product} 
            onUpdate={onUpdate}
          >
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </ProductEditDialog>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOptimizeWithAI(product.id)}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 hover:from-violet-600 hover:to-purple-600"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Optimize
          </Button>
        </div>
      </div>
    </Card>
  );
};