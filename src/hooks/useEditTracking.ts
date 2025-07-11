import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Product, UpdatedProduct } from '@/pages/Index';

interface EditTrackingProps {
  onProductUpdate: (productId: string, updatedData: UpdatedProduct) => void;
}

export const useEditTracking = ({ onProductUpdate }: EditTrackingProps) => {
  const { session } = useSessionContext();

  const trackEdit = async (
    productHandle: string,
    fieldName: string,
    beforeValue: string,
    afterValue: string,
    editType: 'manual' | 'ai_suggestion' | 'bulk_edit' = 'manual'
  ) => {
    if (!session?.user?.id || beforeValue === afterValue) return;

    try {
      await supabase
        .from('product_edit_history')
        .insert({
          user_id: session.user.id,
          product_handle: productHandle,
          field_name: fieldName,
          before_value: beforeValue,
          after_value: afterValue,
          edit_type: editType
        });
    } catch (error) {
      console.error('Error tracking edit:', error);
    }
  };

  const trackProductUpdate = async (
    productHandle: string,
    originalProduct: Product,
    updatedData: UpdatedProduct,
    editType: 'manual' | 'ai_suggestion' | 'bulk_edit' = 'manual'
  ) => {
    const edits = [];

    if (originalProduct.title !== updatedData.title) {
      edits.push({
        fieldName: 'title',
        beforeValue: originalProduct.title,
        afterValue: updatedData.title
      });
    }

    if (originalProduct.type !== updatedData.type) {
      edits.push({
        fieldName: 'type',
        beforeValue: originalProduct.type || '',
        afterValue: updatedData.type
      });
    }

    if (originalProduct.bodyHtml !== updatedData.description) {
      edits.push({
        fieldName: 'description',
        beforeValue: originalProduct.bodyHtml || '',
        afterValue: updatedData.description
      });
    }

    if (originalProduct.tags !== updatedData.tags) {
      edits.push({
        fieldName: 'tags',
        beforeValue: originalProduct.tags || '',
        afterValue: updatedData.tags
      });
    }

    if (originalProduct.category !== updatedData.category) {
      edits.push({
        fieldName: 'category',
        beforeValue: originalProduct.category || '',
        afterValue: updatedData.category || ''
      });
    }

    // Track all edits
    for (const edit of edits) {
      await trackEdit(
        productHandle,
        edit.fieldName,
        edit.beforeValue,
        edit.afterValue,
        editType
      );
    }

    // If this was a manual edit, trigger pattern analysis in background
    if (editType === 'manual' && edits.length > 0) {
      // Trigger pattern analysis asynchronously without waiting
      setTimeout(async () => {
        try {
          await supabase.functions.invoke('analyze-edit-patterns');
          console.log('Background pattern analysis triggered after manual edit');
        } catch (error) {
          console.warn('Background pattern analysis failed:', error);
        }
      }, 1000);
    }

    // Call the original update handler
    onProductUpdate(productHandle, updatedData);
  };

  return {
    trackEdit,
    trackProductUpdate
  };
};