import React, { useState } from 'react';
import { ProductWhisperCard } from '../ProductWhisperCard';
import { ProductWhisperItem } from '@/types/productwhisper';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle } from 'lucide-react';

interface OptimisticProductCardProps {
  product: ProductWhisperItem;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onProductUpdated: () => void;
  onAIOptimized?: (productId: string, optimizedData: any) => void;
}

export const OptimisticProductCard: React.FC<OptimisticProductCardProps> = ({
  product,
  isSelected,
  onSelectionChange,
  onProductUpdated,
  onAIOptimized
}) => {
  const { toast } = useToast();
  const [optimisticState, setOptimisticState] = useState<{
    isOptimizing: boolean;
    isUpdating: boolean;
    pendingChanges: Partial<ProductWhisperItem> | null;
    error: string | null;
  }>({
    isOptimizing: false,
    isUpdating: false,
    pendingChanges: null,
    error: null
  });

  // Merge product data with optimistic changes
  const displayProduct = optimisticState.pendingChanges 
    ? { ...product, ...optimisticState.pendingChanges }
    : product;

  const handleOptimisticUpdate = async (changes: Partial<ProductWhisperItem>) => {
    // Immediately show optimistic changes
    setOptimisticState(prev => ({
      ...prev,
      isUpdating: true,
      pendingChanges: { ...prev.pendingChanges, ...changes },
      error: null
    }));

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - clear optimistic state
      setOptimisticState({
        isOptimizing: false,
        isUpdating: false,
        pendingChanges: null,
        error: null
      });
      
      onProductUpdated();
      
      toast({
        title: "Product Updated",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      // Rollback optimistic changes
      setOptimisticState(prev => ({
        ...prev,
        isUpdating: false,
        pendingChanges: null,
        error: error instanceof Error ? error.message : 'Update failed'
      }));
      
      toast({
        title: "Update Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAIOptimization = async (productId: string, optimizedData: any) => {
    setOptimisticState(prev => ({
      ...prev,
      isOptimizing: true,
      error: null
    }));

    try {
      // Show optimistic AI-optimized state
      setOptimisticState(prev => ({
        ...prev,
        pendingChanges: optimizedData
      }));

      // Call the actual optimization
      if (onAIOptimized) {
        await onAIOptimized(productId, optimizedData);
      }

      setOptimisticState({
        isOptimizing: false,
        isUpdating: false,
        pendingChanges: null,
        error: null
      });
    } catch (error) {
      setOptimisticState(prev => ({
        ...prev,
        isOptimizing: false,
        pendingChanges: null,
        error: error instanceof Error ? error.message : 'AI optimization failed'
      }));
    }
  };

  return (
    <div className="relative">
      {/* Optimistic State Indicators */}
      {optimisticState.isOptimizing && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            AI Optimizing...
          </Badge>
        </div>
      )}

      {optimisticState.isUpdating && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="animate-pulse">
            Saving...
          </Badge>
        </div>
      )}

      {optimisticState.error && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        </div>
      )}

      {/* Card with optimistic opacity */}
      <div className={`transition-opacity duration-300 ${
        optimisticState.isOptimizing || optimisticState.isUpdating 
          ? 'opacity-80' 
          : 'opacity-100'
      }`}>
        <ProductWhisperCard
          product={displayProduct}
          isSelected={isSelected}
          onSelectionChange={onSelectionChange}
          onProductUpdated={onProductUpdated}
          onAIOptimized={handleAIOptimization}
        />
      </div>

      {/* Loading Overlay */}
      {(optimisticState.isOptimizing || optimisticState.isUpdating) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {optimisticState.isOptimizing ? 'AI Optimizing...' : 'Saving...'}
          </div>
        </div>
      )}
    </div>
  );
};