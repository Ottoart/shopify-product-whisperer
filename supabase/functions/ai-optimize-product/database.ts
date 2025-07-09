import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import type { OptimizedProductData } from './types.ts';

export async function updateProduct(
  productHandle: string,
  userId: string,
  optimizedData: OptimizedProductData,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  console.log('Updating database...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Prepare update object with only defined values
  const updateData: any = {
    title: optimizedData.title,
    body_html: optimizedData.description,
    tags: optimizedData.tags,
    type: optimizedData.type,
    seo_title: optimizedData.seo_title,
    seo_description: optimizedData.seo_description,
    updated_at: new Date().toISOString(),
  };

  // Add optional fields only if they have values
  if (optimizedData.vendor) updateData.vendor = optimizedData.vendor;
  if (optimizedData.variant_price !== undefined) updateData.variant_price = optimizedData.variant_price;
  if (optimizedData.variant_compare_at_price !== undefined) updateData.variant_compare_at_price = optimizedData.variant_compare_at_price;
  if (optimizedData.variant_sku) updateData.variant_sku = optimizedData.variant_sku;
  if (optimizedData.variant_barcode) updateData.variant_barcode = optimizedData.variant_barcode;
  if (optimizedData.variant_grams !== undefined) updateData.variant_grams = optimizedData.variant_grams;
  if (optimizedData.google_shopping_condition) updateData.google_shopping_condition = optimizedData.google_shopping_condition;
  if (optimizedData.google_shopping_gender) updateData.google_shopping_gender = optimizedData.google_shopping_gender;
  if (optimizedData.google_shopping_age_group) updateData.google_shopping_age_group = optimizedData.google_shopping_age_group;

  const { error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('handle', productHandle)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Database update error:', updateError);
    throw new Error(`Database update failed: ${updateError.message}`);
  }
  
  console.log('Database updated successfully');
}