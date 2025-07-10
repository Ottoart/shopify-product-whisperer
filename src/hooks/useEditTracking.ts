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

    // Call the original update handler
    onProductUpdate(productHandle, updatedData);
  };

  return {
    trackEdit,
    trackProductUpdate
  };
};