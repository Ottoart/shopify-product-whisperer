import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { Product, UpdatedProduct } from '@/pages/Index';

export const useProducts = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.handle,
        title: item.title,
        handle: item.handle,
        vendor: item.vendor || '',
        type: item.type || '',
        tags: item.tags || '',
        category: item.category || '',
        published: item.published || false,
        option1Name: item.option1_name || '',
        option1Value: item.option1_value || '',
        variantSku: item.variant_sku || '',
        variantGrams: item.variant_grams || 0,
        variantInventoryTracker: item.variant_inventory_tracker || '',
        variantInventoryQty: item.variant_inventory_qty || 0,
        variantInventoryPolicy: item.variant_inventory_policy || '',
        variantFulfillmentService: item.variant_fulfillment_service || '',
        variantPrice: item.variant_price || 0,
        variantCompareAtPrice: item.variant_compare_at_price || 0,
        variantRequiresShipping: item.variant_requires_shipping || true,
        variantTaxable: item.variant_taxable || true,
        variantBarcode: item.variant_barcode || '',
        imagePosition: item.image_position || 0,
        imageSrc: item.image_src || '',
        bodyHtml: item.body_html || '',
        seoTitle: item.seo_title || '',
        seoDescription: item.seo_description || '',
        googleShoppingCondition: item.google_shopping_condition || '',
        googleShoppingGender: item.google_shopping_gender || '',
        googleShoppingAgeGroup: item.google_shopping_age_group || '',
      }));
    },
    enabled: !!session?.user?.id,
  });

  const saveProductsMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const productsToInsert = products.map(product => ({
        user_id: session.user.id,
        handle: product.handle,
        title: product.title,
        vendor: product.vendor,
        type: product.type,
        tags: product.tags,
        category: product.category,
        published: product.published,
        option1_name: product.option1Name,
        option1_value: product.option1Value,
        variant_sku: product.variantSku,
        variant_grams: product.variantGrams,
        variant_inventory_tracker: product.variantInventoryTracker,
        variant_inventory_qty: product.variantInventoryQty,
        variant_inventory_policy: product.variantInventoryPolicy,
        variant_fulfillment_service: product.variantFulfillmentService,
        variant_price: product.variantPrice,
        variant_compare_at_price: product.variantCompareAtPrice,
        variant_requires_shipping: product.variantRequiresShipping,
        variant_taxable: product.variantTaxable,
        variant_barcode: product.variantBarcode,
        image_position: product.imagePosition,
        image_src: product.imageSrc,
        body_html: product.bodyHtml,
        seo_title: product.seoTitle,
        seo_description: product.seoDescription,
        google_shopping_condition: product.googleShoppingCondition,
        google_shopping_gender: product.googleShoppingGender,
        google_shopping_age_group: product.googleShoppingAgeGroup,
      }));

      const { error } = await supabase
        .from('products')
        .upsert(productsToInsert, { 
          onConflict: 'handle,user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Products Saved",
        description: "Your products have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ handle, updatedData }: { handle: string; updatedData: UpdatedProduct }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('products')
        .update({
          title: updatedData.title,
          type: updatedData.type,
          category: updatedData.category,
          body_html: updatedData.description,
          tags: updatedData.tags,
        })
        .eq('handle', handle)
        .eq('user_id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    products,
    isLoading,
    saveProducts: saveProductsMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    isSaving: saveProductsMutation.isPending,
    isUpdating: updateProductMutation.isPending,
  };
};