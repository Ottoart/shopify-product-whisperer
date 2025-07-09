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
  
  const { error: updateError } = await supabase
    .from('products')
    .update({
      title: optimizedData.title,
      body_html: optimizedData.description,
      tags: optimizedData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('handle', productHandle)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Database update error:', updateError);
    throw new Error(`Database update failed: ${updateError.message}`);
  }
  
  console.log('Database updated successfully');
}