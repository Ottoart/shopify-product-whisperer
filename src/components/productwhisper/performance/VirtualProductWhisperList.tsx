import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ProductWhisperCard } from '../ProductWhisperCard';
import { ProductWhisperItem } from '@/types/productwhisper';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualProductWhisperListProps {
  products: ProductWhisperItem[];
  height: number;
  width: number;
  itemHeight: number;
  onProductUpdated: () => void;
  onAIOptimized?: (productId: string, optimizedData: any) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  selectedProducts?: Set<string>;
  onSelectionChange?: (productId: string, selected: boolean) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: ProductWhisperItem[];
    selectedProducts: Set<string>;
    onSelectionChange: (productId: string, selected: boolean) => void;
    onProductUpdated: () => void;
    onAIOptimized?: (productId: string, optimizedData: any) => void;
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isLoading?: boolean;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const {
    products,
    selectedProducts,
    onSelectionChange,
    onProductUpdated,
    onAIOptimized,
    onLoadMore,
    hasNextPage,
    isLoading
  } = data;

  // Trigger load more when near the end
  useEffect(() => {
    if (
      onLoadMore &&
      hasNextPage &&
      !isLoading &&
      index >= products.length - 5
    ) {
      onLoadMore();
    }
  }, [index, products.length, onLoadMore, hasNextPage, isLoading]);

  // Show loading skeleton for items beyond current data
  if (index >= products.length) {
    return (
      <div style={style} className="p-3">
        <Card className="h-full animate-pulse">
          <div className="p-4 space-y-3">
            <Skeleton className="h-48 w-full rounded" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const product = products[index];
  
  return (
    <div style={style} className="p-3">
      <ProductWhisperCard
        product={product}
        isSelected={selectedProducts.has(product.id)}
        onSelectionChange={(selected) => onSelectionChange(product.id, selected)}
        onProductUpdated={onProductUpdated}
        onAIOptimized={onAIOptimized}
      />
    </div>
  );
};

export const VirtualProductWhisperList: React.FC<VirtualProductWhisperListProps> = ({
  products,
  height,
  width,
  itemHeight,
  onProductUpdated,
  onAIOptimized,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  selectedProducts = new Set(),
  onSelectionChange = () => {}
}) => {
  const itemData = useMemo(() => ({
    products,
    selectedProducts,
    onSelectionChange,
    onProductUpdated,
    onAIOptimized,
    onLoadMore,
    hasNextPage,
    isLoading
  }), [
    products,
    selectedProducts,
    onSelectionChange,
    onProductUpdated,
    onAIOptimized,
    onLoadMore,
    hasNextPage,
    isLoading
  ]);

  // Include loading items if we have more to load
  const itemCount = hasNextPage ? products.length + 10 : products.length;

  return (
    <List
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemHeight}
      itemData={itemData}
      className="virtual-product-list"
    >
      {Row}
    </List>
  );
};