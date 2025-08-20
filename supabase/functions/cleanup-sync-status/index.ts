import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncConflict {
  type: 'state_mismatch' | 'stuck_sync' | 'stale_pagination' | 'count_mismatch';
  description: string;
  marketplace_status?: string;
  shopify_status?: string;
  last_activity?: string;
  resolution_action: string;
}

interface CleanupResult {
  user_id: string;
  conflicts_detected: SyncConflict[];
  conflicts_resolved: SyncConflict[];
  final_sync_status: string;
  can_resume: boolean;
  actual_product_count: number;
  recommendations: string[];
}

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

    const { marketplace = 'shopify', force_reset = false } = await req.json();

    console.log(`Starting sync status cleanup for user ${user.id}, marketplace: ${marketplace}`);

    // Step 1: Gather current state from all related tables
    const [
      { data: marketplaceStatus },
      { data: shopifyStatus },
      { count: actualProductCount }
    ] = await Promise.all([
      supabase
        .from('marketplace_sync_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('marketplace', marketplace)
        .maybeSingle(),
      supabase
        .from('shopify_sync_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ]);

    const result: CleanupResult = {
      user_id: user.id,
      conflicts_detected: [],
      conflicts_resolved: [],
      final_sync_status: 'pending',
      can_resume: false,
      actual_product_count: actualProductCount || 0,
      recommendations: []
    };

    // Step 2: Detect conflicts and issues
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Check for state mismatches
    if (marketplaceStatus && shopifyStatus) {
      if (marketplaceStatus.sync_status !== shopifyStatus.sync_status) {
        result.conflicts_detected.push({
          type: 'state_mismatch',
          description: `Marketplace status (${marketplaceStatus.sync_status}) doesn't match Shopify status (${shopifyStatus.sync_status})`,
          marketplace_status: marketplaceStatus.sync_status,
          shopify_status: shopifyStatus.sync_status,
          resolution_action: 'Align statuses based on actual progress'
        });
      }
    }

    // Check for stuck syncs
    if (shopifyStatus && shopifyStatus.sync_status === 'in_progress') {
      const lastSyncAt = new Date(shopifyStatus.last_sync_at || shopifyStatus.created_at);
      if (lastSyncAt < thirtyMinutesAgo) {
        result.conflicts_detected.push({
          type: 'stuck_sync',
          description: `Sync has been in progress for ${Math.round((now.getTime() - lastSyncAt.getTime()) / (1000 * 60))} minutes without progress`,
          last_activity: lastSyncAt.toISOString(),
          resolution_action: 'Reset to allow resume or fresh start'
        });
      }
    }

    // Check for stale pagination data
    if (shopifyStatus && shopifyStatus.last_page_info && shopifyStatus.sync_status !== 'in_progress') {
      result.conflicts_detected.push({
        type: 'stale_pagination',
        description: 'Pagination data exists but sync is not in progress',
        resolution_action: 'Clear stale pagination data'
      });
    }

    // Check for count mismatches
    if (marketplaceStatus && marketplaceStatus.products_synced !== actualProductCount) {
      result.conflicts_detected.push({
        type: 'count_mismatch',
        description: `Recorded sync count (${marketplaceStatus.products_synced}) doesn't match actual products (${actualProductCount})`,
        resolution_action: 'Update recorded count to match actual data'
      });
    }

    console.log(`Detected ${result.conflicts_detected.length} conflicts:`, result.conflicts_detected);

    // Step 3: Resolve conflicts
    if (result.conflicts_detected.length > 0 || force_reset) {
      // Determine the correct sync status based on analysis
      let targetSyncStatus = 'pending';
      let canResume = false;
      let shouldClearPagination = false;

      // If we have products and valid pagination, we might be able to resume
      if (actualProductCount > 0 && shopifyStatus?.last_page_info && !force_reset) {
        // Check if the stuck sync can be resumed
        const stuckSyncConflict = result.conflicts_detected.find(c => c.type === 'stuck_sync');
        if (stuckSyncConflict) {
          targetSyncStatus = 'pending'; // Reset to pending to allow restart
          canResume = true;
          result.recommendations.push('Sync can be resumed from last known position');
        }
      } else if (force_reset || actualProductCount === 0) {
        // Force reset or no products - start fresh
        targetSyncStatus = 'pending';
        shouldClearPagination = true;
        result.recommendations.push('Sync will start fresh from the beginning');
      } else {
        // Products exist but no valid resume point
        targetSyncStatus = actualProductCount > 0 ? 'completed' : 'pending';
        shouldClearPagination = true;
        result.recommendations.push(actualProductCount > 0 ? 'Sync appears completed based on product count' : 'Sync will start fresh');
      }

      // Prepare update data for marketplace_sync_status
      const marketplaceUpdateData = {
        user_id: user.id,
        marketplace: marketplace,
        sync_status: targetSyncStatus,
        products_synced: actualProductCount,
        total_products_found: Math.max(actualProductCount, marketplaceStatus?.total_products_found || 0),
        last_sync_at: new Date().toISOString(),
        error_message: null,
        sync_settings: marketplaceStatus?.sync_settings || {},
        active_products_synced: actualProductCount,
        inactive_products_skipped: marketplaceStatus?.inactive_products_skipped || 0
      };

      // Prepare update data for shopify_sync_status
      const shopifyUpdateData: any = {
        user_id: user.id,
        sync_status: targetSyncStatus,
        last_sync_at: new Date().toISOString(),
        error_message: null
      };

      if (shouldClearPagination) {
        shopifyUpdateData.last_page_info = null;
        shopifyUpdateData.current_page = null;
        shopifyUpdateData.total_pages = null;
        shopifyUpdateData.products_per_page = null;
      }

      // Execute updates in a transaction-like manner
      const [marketplaceUpdateResult, shopifyUpdateResult] = await Promise.all([
        supabase
          .from('marketplace_sync_status')
          .upsert(marketplaceUpdateData, {
            onConflict: 'user_id,marketplace'
          }),
        supabase
          .from('shopify_sync_status')
          .upsert(shopifyUpdateData, {
            onConflict: 'user_id'
          })
      ]);

      if (marketplaceUpdateResult.error || shopifyUpdateResult.error) {
        throw new Error(`Failed to update sync status: ${marketplaceUpdateResult.error?.message || shopifyUpdateResult.error?.message}`);
      }

      // Mark conflicts as resolved
      result.conflicts_resolved = [...result.conflicts_detected];
      result.final_sync_status = targetSyncStatus;
      result.can_resume = canResume;

      console.log(`Successfully resolved ${result.conflicts_resolved.length} conflicts. Final status: ${targetSyncStatus}`);

      // Add specific recommendations based on resolved conflicts
      if (result.conflicts_resolved.some(c => c.type === 'stuck_sync')) {
        result.recommendations.push('Stuck sync has been reset and can now be restarted');
      }
      if (result.conflicts_resolved.some(c => c.type === 'state_mismatch')) {
        result.recommendations.push('Sync status has been aligned across all tables');
      }
      if (result.conflicts_resolved.some(c => c.type === 'count_mismatch')) {
        result.recommendations.push('Product count has been corrected to match actual database state');
      }
      if (shouldClearPagination) {
        result.recommendations.push('Stale pagination data has been cleared');
      }

    } else {
      result.final_sync_status = marketplaceStatus?.sync_status || 'pending';
      result.can_resume = shopifyStatus?.last_page_info ? true : false;
      result.recommendations.push('No conflicts detected - sync status is consistent');
    }

    return new Response(JSON.stringify({
      success: true,
      cleanup_result: result,
      message: `Cleanup completed. ${result.conflicts_resolved.length} conflicts resolved. Status: ${result.final_sync_status}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync status cleanup:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      cleanup_result: null
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});