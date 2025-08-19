import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { marketplace = 'shopify' } = await req.json();

    console.log(`Reconciling sync status for user ${user.id}, marketplace: ${marketplace}`);

    // Get actual product count from database
    const { count: actualProductCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get current sync status
    const { data: currentStatus } = await supabase
      .from('marketplace_sync_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('marketplace', marketplace)
      .maybeSingle();

    // Get Shopify sync status for more accurate data
    const { data: shopifyStatus } = await supabase
      .from('shopify_sync_status')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const actualCount = actualProductCount || 0;
    
    // Determine if sync is truly complete
    const isComplete = shopifyStatus?.sync_status === 'completed' || 
                      (currentStatus?.sync_status === 'completed') ||
                      (actualCount > 0 && !shopifyStatus?.last_page_info);

    // Prepare reconciled data
    const reconciledData = {
      user_id: user.id,
      marketplace: marketplace,
      products_synced: actualCount,
      total_products_found: Math.max(actualCount, currentStatus?.total_products_found || 0),
      sync_status: isComplete ? 'completed' : (currentStatus?.sync_status || 'pending'),
      last_sync_at: shopifyStatus?.last_sync_at || currentStatus?.last_sync_at || new Date().toISOString(),
      error_message: null,
      sync_settings: currentStatus?.sync_settings || {},
      active_products_synced: actualCount,
      inactive_products_skipped: currentStatus?.inactive_products_skipped || 0
    };

    // Update marketplace sync status
    const { error: updateError } = await supabase
      .from('marketplace_sync_status')
      .upsert(reconciledData, {
        onConflict: 'user_id,marketplace'
      });

    if (updateError) {
      throw new Error(`Failed to update sync status: ${updateError.message}`);
    }

    console.log(`Sync status reconciled: ${actualCount} products synced`);

    return new Response(JSON.stringify({
      success: true,
      actualProductCount,
      reconciledData,
      message: `Sync status reconciled: ${actualCount} products found in database`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync reconciliation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});