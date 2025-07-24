import React from 'react';
import { ProductListItem } from './ProductListItem';
import { Product } from '@/pages/Products';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface ProductListProps {
  products: Product[];
  onProductUpdate: () => void;
  onOptimizeWithAI: (productId: string) => void;
  selectedProducts: Product[];
  onProductSelect: (product: Product, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onProductUpdate, 
  onOptimizeWithAI,
  selectedProducts,
  onProductSelect,
  onSelectAll
}) => {
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

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
            onCheckedChange={(checked) => onSelectAll(!!checked)}
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
          onUpdate={onProductUpdate}
          onOptimizeWithAI={onOptimizeWithAI}
          isSelected={selectedProducts.some(p => p.id === product.id)}
          onSelect={(isSelected) => onProductSelect(product, isSelected)}
        />
      ))}
    </div>
  );
};