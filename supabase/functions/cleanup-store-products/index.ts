import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { storeId, cleanupType = 'soft' } = await req.json();

    if (!storeId) {
      throw new Error('Store ID is required');
    }

    console.log(`Starting cleanup for store ${storeId}, type: ${cleanupType}`);

    // Get store information
    const { data: store, error: storeError } = await supabaseClient
      .from('store_configurations')
      .select('*')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      throw new Error('Store not found or access denied');
    }

    let deletedCount = 0;
    
    if (cleanupType === 'hard') {
      // Hard delete - permanently remove products
      const { count, error: deleteError } = await supabaseClient
        .from('products')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .eq('vendor', store.store_name);

      if (deleteError) {
        throw deleteError;
      }
      deletedCount = count || 0;
    } else {
      // Soft cleanup - mark products as inactive or move to archive
      const { count, error: updateError } = await supabaseClient
        .from('products')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('user_id', user.id)
        .eq('vendor', store.store_name);

      if (updateError) {
        throw updateError;
      }
      deletedCount = count || 0;
    }

    // Log the cleanup operation
    await supabaseClient
      .from('audit_logs')
      .insert({
        event_type: 'manual_store_cleanup',
        user_id: user.id,
        details: {
          store_id: storeId,
          store_name: store.store_name,
          cleanup_type: cleanupType,
          products_affected: deletedCount,
          trigger: 'manual_cleanup_function'
        }
      });

    console.log(`Cleanup completed: ${deletedCount} products ${cleanupType === 'hard' ? 'deleted' : 'archived'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully ${cleanupType === 'hard' ? 'deleted' : 'archived'} ${deletedCount} products`,
        productsAffected: deletedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});