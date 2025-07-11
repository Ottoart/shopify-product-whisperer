import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

interface ProductDraft {
  id: string;
  product_handle: string;
  draft_name: string;
  optimized_data: {
    title: string;
    description: string;
    tags: string;
    type: string;
    category: string;
  };
  created_at: string;
  updated_at: string;
}

export const useProductDrafts = (productHandle?: string) => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch drafts for a specific product
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['product-drafts', productHandle],
    queryFn: async () => {
      if (!session?.user?.id || !productHandle) return [];
      
      const { data, error } = await supabase
        .from('product_drafts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_handle', productHandle)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id && !!productHandle,
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({ 
      productHandle, 
      draftName, 
      optimizedData 
    }: { 
      productHandle: string; 
      draftName: string; 
      optimizedData: ProductDraft['optimized_data'] 
    }) => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('product_drafts')
        .insert({
          user_id: session.user.id,
          product_handle: productHandle,
          draft_name: draftName,
          optimized_data: optimizedData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-drafts', productHandle] });
      toast({
        title: "Draft Saved",
        description: "Your product optimization has been saved as a draft.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save draft.",
        variant: "destructive",
      });
    },
  });

  // Update draft mutation
  const updateDraftMutation = useMutation({
    mutationFn: async ({ 
      draftId, 
      draftName, 
      optimizedData 
    }: { 
      draftId: string; 
      draftName: string; 
      optimizedData: ProductDraft['optimized_data'] 
    }) => {
      const { data, error } = await supabase
        .from('product_drafts')
        .update({
          draft_name: draftName,
          optimized_data: optimizedData
        })
        .eq('id', draftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-drafts', productHandle] });
      toast({
        title: "Draft Updated",
        description: "Your draft has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update draft.",
        variant: "destructive",
      });
    },
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const { error } = await supabase
        .from('product_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-drafts', productHandle] });
      toast({
        title: "Draft Deleted",
        description: "Draft has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete draft.",
        variant: "destructive",
      });
    },
  });

  const saveDraft = (draftName: string, optimizedData: ProductDraft['optimized_data']) => {
    if (!productHandle) return;
    saveDraftMutation.mutate({ productHandle, draftName, optimizedData });
  };

  const updateDraft = (draftId: string, draftName: string, optimizedData: ProductDraft['optimized_data']) => {
    updateDraftMutation.mutate({ draftId, draftName, optimizedData });
  };

  const deleteDraft = (draftId: string) => {
    deleteDraftMutation.mutate(draftId);
  };

  return {
    drafts,
    isLoading,
    saveDraft,
    updateDraft,
    deleteDraft,
    isSaving: saveDraftMutation.isPending,
    isUpdating: updateDraftMutation.isPending,
    isDeleting: deleteDraftMutation.isPending,
  };
};