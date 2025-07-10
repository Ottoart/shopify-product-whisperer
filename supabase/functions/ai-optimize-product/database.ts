import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import type { OptimizedProductData } from './types.ts';

export async function updateProduct(
  productHandle: string,
  userId: string,
  optimizedData: OptimizedProductData,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  console.log('Updating database with AI optimization...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // First, get the current product data to preserve any manual edits
  const { data: currentProduct, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('handle', productHandle)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching current product:', fetchError);
    throw new Error(`Failed to fetch current product: ${fetchError.message}`);
  }

  // Get recent manual edits (within last 10 minutes) to preserve them
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recentEdits, error: editsError } = await supabase
    .from('product_edit_history')
    .select('field_name, after_value')
    .eq('product_handle', productHandle)
    .eq('user_id', userId)
    .eq('edit_type', 'manual')
    .gte('created_at', tenMinutesAgo)
    .order('created_at', { ascending: false });

  if (editsError) {
    console.error('Error fetching recent edits:', editsError);
  }

  // Build update object, preserving manual edits where they exist
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  // Helper function to check if field was manually edited recently
  const wasManuallyEdited = (fieldName: string) => {
    return recentEdits?.some(edit => edit.field_name === fieldName);
  };

  // Only update fields that weren't manually edited recently
  if (!wasManuallyEdited('title')) {
    updateData.title = optimizedData.title;
  }
  if (!wasManuallyEdited('description')) {
    updateData.body_html = optimizedData.description;
  }
  if (!wasManuallyEdited('tags')) {
    updateData.tags = optimizedData.tags;
  }
  if (!wasManuallyEdited('type')) {
    updateData.type = optimizedData.type;
  }
  if (!wasManuallyEdited('category')) {
    updateData.category = optimizedData.category;
  }

  // Always update SEO fields (usually not manually edited)
  updateData.seo_title = optimizedData.seo_title;
  updateData.seo_description = optimizedData.seo_description;

  // Add optional fields only if they have values and weren't manually edited
  if (optimizedData.vendor && !wasManuallyEdited('vendor')) {
    updateData.vendor = optimizedData.vendor;
  }
  if (optimizedData.variant_price !== undefined && optimizedData.variant_price !== null) {
    updateData.variant_price = optimizedData.variant_price;
  }
  if (optimizedData.variant_compare_at_price !== undefined && optimizedData.variant_compare_at_price !== null) {
    updateData.variant_compare_at_price = optimizedData.variant_compare_at_price;
  }
  if (optimizedData.variant_sku) updateData.variant_sku = optimizedData.variant_sku;
  if (optimizedData.variant_barcode) updateData.variant_barcode = optimizedData.variant_barcode;
  if (optimizedData.variant_grams !== undefined && optimizedData.variant_grams !== null) {
    updateData.variant_grams = optimizedData.variant_grams;
  }
  if (optimizedData.google_shopping_condition) updateData.google_shopping_condition = optimizedData.google_shopping_condition;
  if (optimizedData.google_shopping_gender) updateData.google_shopping_gender = optimizedData.google_shopping_gender;
  if (optimizedData.google_shopping_age_group) updateData.google_shopping_age_group = optimizedData.google_shopping_age_group;

  console.log('Preserving manual edits for fields:', recentEdits?.map(e => e.field_name) || []);
  console.log('Updating fields:', Object.keys(updateData).filter(k => k !== 'updated_at'));

  const { error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('handle', productHandle)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Database update error:', updateError);
    throw new Error(`Database update failed: ${updateError.message}`);
  }
  
  console.log('Database updated successfully, manual edits preserved');
}