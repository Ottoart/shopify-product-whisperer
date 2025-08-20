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

    // Check for stuck syncs (in_progress for more than 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    // Reset stuck marketplace_sync_status
    const { data: stuckMarketplaceSyncs } = await supabase
      .from('marketplace_sync_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_status', 'syncing')
      .lt('updated_at', thirtyMinutesAgo);

    // Reset stuck shopify_sync_status
    const { data: stuckShopifySyncs } = await supabase
      .from('shopify_sync_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_status', 'in_progress')
      .lt('updated_at', thirtyMinutesAgo);

    let resetCount = 0;

    if (stuckMarketplaceSyncs && stuckMarketplaceSyncs.length > 0) {
      await supabase
        .from('marketplace_sync_status')
        .update({
          sync_status: 'success',
          updated_at: new Date().toISOString(),
          error_message: null
        })
        .eq('user_id', user.id)
        .eq('sync_status', 'syncing')
        .lt('updated_at', thirtyMinutesAgo);
      
      resetCount += stuckMarketplaceSyncs.length;
    }

    if (stuckShopifySyncs && stuckShopifySyncs.length > 0) {
      await supabase
        .from('shopify_sync_status')
        .update({
          sync_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('sync_status', 'in_progress')
        .lt('updated_at', thirtyMinutesAgo);
      
      resetCount += stuckShopifySyncs.length;
    }

    console.log(`Reset ${resetCount} stuck sync records for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      resetCount,
      message: resetCount > 0 ? `Reset ${resetCount} stuck sync records` : 'No stuck syncs found'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cleanup-sync-status:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});