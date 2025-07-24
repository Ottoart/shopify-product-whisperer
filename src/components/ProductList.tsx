import React from 'react';
import { ProductListItem } from './ProductListItem';
import { Product } from '@/pages/Index';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface ProductListProps {
  products: Product[];
  onProductUpdate?: () => void;
  onOptimizeWithAI?: (productId: string) => void;
  selectedProducts?: string[];
  onSelectionChange?: (productIds: string[]) => void;
  onAddToQueue?: (productIds: string[]) => void;
  onProductsUpdated?: () => void;
  onProductUpdated?: (productId: string, updatedData: any) => void;
  storeUrl?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onProductUpdate,
  onOptimizeWithAI,
  selectedProducts = [],
  onSelectionChange,
  onAddToQueue,
  onProductsUpdated,
  onProductUpdated,
  storeUrl
}) => {
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const handleProductSelect = (product: Product, isSelected: boolean) => {
    if (!onSelectionChange) return;
    
    if (isSelected) {
      onSelectionChange([...selectedProducts, product.id]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== product.id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (!onSelectionChange) return;
    
    if (isSelected) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No products found. Try adjusting your filters or sync your store.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={isAllSelected}
            {...(isIndeterminate ? { 'data-indeterminate': true } : {})}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            {selectedProducts.length === 0 
              ? `Select all ${products.length} products`
              : `${selectedProducts.length} of ${products.length} products selected`
            }
          </label>
        </div>
      </Card>

      {/* Product Items */}
      {products.map((product) => (
        <ProductListItem
          key={product.id}
          product={product}
          onUpdate={onProductUpdate || (() => {})}
          onOptimizeWithAI={onOptimizeWithAI || (() => {})}
          isSelected={selectedProducts.includes(product.id)}
          onSelect={(isSelected) => handleProductSelect(product, isSelected)}
        />
      ))}
    </div>
  );
};