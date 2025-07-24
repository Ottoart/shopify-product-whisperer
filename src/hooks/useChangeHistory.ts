import { useState } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChangeHistoryEntry {
  id: string;
  product_handle: string;
  field_name: string;
  before_value: string;
  after_value: string;
  edit_type: 'manual' | 'ai_suggestion' | 'bulk_edit';
  created_at: string;
}

export const useChangeHistory = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [isReverting, setIsReverting] = useState(false);

  const trackChange = async (
    productHandle: string,
    fieldName: string,
    beforeValue: string,
    afterValue: string,
    editType: 'manual' | 'ai_suggestion' | 'bulk_edit' = 'manual'
  ) => {
    if (!session?.user?.id || beforeValue === afterValue) return;

    try {
      const { error } = await supabase
        .from('product_edit_history')
        .insert({
          user_id: session.user.id,
          product_handle: productHandle,
          field_name: fieldName,
          before_value: beforeValue,
          after_value: afterValue,
          edit_type: editType
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking change:', error);
    }
  };

  const revertChange = async (change: ChangeHistoryEntry) => {
    if (!session?.user?.id) return false;

    setIsReverting(true);
    try {
      // Get current product
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('handle', change.product_handle)
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) throw fetchError;

      // Map field names to database columns
      const fieldMap: Record<string, string> = {
        'title': 'title',
        'description': 'body_html',
        'tags': 'tags',
        'type': 'type',
        'category': 'category',
        'vendor': 'vendor',
        'price': 'variant_price',
        'inventory': 'variant_inventory_qty',
        'sku': 'variant_sku'
      };

      const dbField = fieldMap[change.field_name] || change.field_name;
      const updateData: any = {
        [dbField]: change.before_value,
        updated_at: new Date().toISOString()
      };

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('handle', change.product_handle)
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      // Track the reversion
      await trackChange(
        change.product_handle,
        change.field_name,
        change.after_value,
        change.before_value,
        'manual'
      );

      toast({
        title: "Change Reverted",
        description: `${change.field_name} has been reverted successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error reverting change:', error);
      toast({
        title: "Revert Failed",
        description: "Failed to revert the change",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsReverting(false);
    }
  };

  const getHistory = async (productHandle?: string, limit = 100) => {
    if (!session?.user?.id) return [];

    try {
      let query = supabase
        .from('product_edit_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productHandle) {
        query = query.eq('product_handle', productHandle);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  };

  return {
    trackChange,
    revertChange,
    getHistory,
    isReverting
  };
};