import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock interface for backward compatibility
export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  type: string;
  tags: string;
  category: string;
  published: boolean;
  option1Name: string;
  option1Value: string;
  variantSku: string;
  variantGrams: number;
  variantInventoryTracker: string;
  variantInventoryQty: number;
  variantInventoryPolicy: string;
  variantFulfillmentService: string;
  variantPrice: number;
  variantCompareAtPrice: number;
  variantRequiresShipping: boolean;
  variantTaxable: boolean;
  variantBarcode: string;
  imagePosition: number;
  imageSrc: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  googleShoppingCondition: string;
  googleShoppingGender: string;
  googleShoppingAgeGroup: string;
  updatedAt?: string;
  shopifySyncStatus?: string;
  shopifySyncedAt?: string;
}

export interface UpdatedProduct {
  title: string;
  type: string;
  category: string;
  description: string;
  tags: string;
  vendor: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  variantPrice: number;
  variantCompareAtPrice: number;
  variantSku: string;
  variantBarcode: string;
  variantGrams: number;
  variantInventoryQty: number;
  variantInventoryPolicy: string;
  variantRequiresShipping: boolean;
  variantTaxable: boolean;
  googleShoppingCondition: string;
  googleShoppingGender: string;
  googleShoppingAgeGroup: string;
}

export const useProducts = () => {
  const { toast } = useToast();
  
  // Mock data - ProductWhisper system removed
  const products: Product[] = [];
  const isLoading = false;

  const saveProducts = (products: Product[]) => {
    console.log('Products system removed - mock save called');
    toast({
      title: "Products System Removed",
      description: "The ProductWhisper system has been removed from this application.",
      variant: "destructive",
    });
  };

  const updateProduct = ({ handle, updatedData }: { handle: string; updatedData: UpdatedProduct }) => {
    console.log('Products system removed - mock update called');
    toast({
      title: "Products System Removed", 
      description: "The ProductWhisper system has been removed from this application.",
      variant: "destructive",
    });
  };

  const deleteProducts = (productHandles: string[]) => {
    console.log('Products system removed - mock delete called');
    toast({
      title: "Products System Removed",
      description: "The ProductWhisper system has been removed from this application.", 
      variant: "destructive",
    });
  };

  return {
    products,
    isLoading,
    saveProducts,
    updateProduct,
    deleteProducts,
    isSaving: false,
    isUpdating: false,
    isDeleting: false,
  };
};