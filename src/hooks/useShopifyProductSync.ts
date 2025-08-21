import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock implementation - ProductWhisper system removed
export interface SyncProgress {
  current: number;
  total: number;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message: string;
}

export function useShopifyProductSync() {
  const { toast } = useToast();
  const [progress, setProgress] = useState<SyncProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: ''
  });

  const syncProducts = async () => {
    toast({
      title: "ProductWhisper System Removed",
      description: "Product sync functionality has been removed from this application.",
      variant: "destructive",
    });
  };

  const startFullSync = async () => {
    toast({
      title: "ProductWhisper System Removed",
      description: "Product sync functionality has been removed from this application.",
      variant: "destructive",
    });
  };

  const startGraphQLBulkSync = async () => {
    toast({
      title: "ProductWhisper System Removed",
      description: "Product sync functionality has been removed from this application.",
      variant: "destructive",
    });
  };

  const syncBatch = async () => {
    toast({
      title: "ProductWhisper System Removed",
      description: "Product sync functionality has been removed from this application.",
      variant: "destructive",
    });
  };

  const resetProgress = () => {
    setProgress({
      current: 0,
      total: 0,
      status: 'idle',
      message: ''
    });
  };

  return {
    progress,
    syncProducts,
    startFullSync,
    startGraphQLBulkSync,
    syncBatch,
    resetProgress,
    isLoading: false,
    isSyncing: false,
    syncStatus: null,
    statusLoading: false,
    localProductsCount: 0,
    localProducts: [],
    productsLoading: false,
    isCompleted: false,
    isInProgress: false,
    lastSyncAt: null,
    advancedSettings: {
      batch_size: 250,
      max_pages: 500,
      early_termination_threshold: 10,
      rate_limit_delay: 500,
      auto_recovery: true,
      validation_checks: true
    },
    setAdvancedSettings: () => {}
  };
}