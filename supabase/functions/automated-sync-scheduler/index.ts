import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncSchedule {
  id: string;
  name: string;
  suppliers: string[];
  collections: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  is_active: boolean;
  last_run: string | null;
  next_run: string;
  settings: {
    maxProducts?: number;
    priceChangeThreshold?: number;
    autoApprove?: boolean;
    notifications?: boolean;
  };
}

interface PriceAlert {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  supplier: string;
}

function calculateNextRun(frequency: string, timeOfDay: string): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, schedule for tomorrow/next period
  if (nextRun <= now) {
    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }
  
  return nextRun;
}

async function triggerScrapingEngine(schedule: SyncSchedule, supabase: any): Promise<any> {
  try {
    console.log(`🔄 Triggering scraping for schedule: ${schedule.name}`);
    
    const { data, error } = await supabase.functions.invoke('enhanced-scraping-engine', {
      body: {
        suppliers: schedule.suppliers,
        collections: schedule.collections,
        maxProducts: schedule.settings.maxProducts || 100
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error triggering scraping engine:', error);
    throw error;
  }
}

async function checkPriceChanges(supabase: any, threshold: number = 0.1): Promise<PriceAlert[]> {
  try {
    // Get price changes from the last sync
    const { data: priceChanges, error } = await supabase
      .from('price_history')
      .select(`
        *,
        store_products!inner(id, name, supplier)
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (error) throw error;

    const alerts: PriceAlert[] = [];

    for (const change of priceChanges || []) {
      const changePercentage = Math.abs((change.new_price - change.old_price) / change.old_price);
      
      if (changePercentage >= threshold) {
        alerts.push({
          productId: change.product_id,
          productName: change.store_products.name,
          oldPrice: change.old_price,
          newPrice: change.new_price,
          changePercentage: changePercentage * 100,
          supplier: change.store_products.supplier
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking price changes:', error);
    return [];
  }
}

async function detectDiscontinuedProducts(supabase: any): Promise<string[]> {
  try {
    // Products that haven't been updated in over 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: staleProducts, error } = await supabase
      .from('store_products')
      .select('id, name, supplier, updated_at')
      .lt('updated_at', thirtyDaysAgo)
      .eq('status', 'active');

    if (error) throw error;

    const discontinuedIds: string[] = [];

    for (const product of staleProducts || []) {
      // Mark as potentially discontinued
      await supabase
        .from('store_products')
        .update({ 
          status: 'discontinued',
          in_stock: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      discontinuedIds.push(product.id);
    }

    return discontinuedIds;
  } catch (error) {
    console.error('Error detecting discontinued products:', error);
    return [];
  }
}

async function sendNotifications(
  supabase: any, 
  schedule: SyncSchedule, 
  syncResult: any, 
  priceAlerts: PriceAlert[], 
  discontinuedProducts: string[]
): Promise<void> {
  try {
    if (!schedule.settings.notifications) return;

    const notification = {
      type: 'automated_sync_complete',
      title: `Sync Complete: ${schedule.name}`,
      message: `
        Sync completed successfully:
        - ${syncResult.details.totalProductsFound} products found
        - ${syncResult.details.inserted} new products added
        - ${syncResult.details.updated} products updated
        - ${priceAlerts.length} significant price changes
        - ${discontinuedProducts.length} products marked as discontinued
      `,
      metadata: {
        scheduleId: schedule.id,
        syncResult,
        priceAlerts: priceAlerts.slice(0, 10), // Limit to first 10
        discontinuedCount: discontinuedProducts.length
      }
    };

    // Store notification (could be sent via email, webhook, etc.)
    await supabase.from('sync_notifications').insert(notification);

    console.log(`📧 Notification created for schedule: ${schedule.name}`);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⏰ Automated Sync Scheduler starting...');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action = 'run_due_syncs', scheduleId } = await req.json();

    if (action === 'run_due_syncs') {
      // Find all schedules that are due to run
      const now = new Date().toISOString();
      
      const { data: dueSchedules, error } = await supabase
        .from('sync_schedules')
        .select('*')
        .eq('is_active', true)
        .lte('next_run', now);

      if (error) throw error;

      console.log(`📋 Found ${dueSchedules?.length || 0} schedules due for sync`);

      const results = [];

      for (const schedule of dueSchedules || []) {
        try {
          console.log(`🔄 Processing schedule: ${schedule.name}`);

          // Trigger the scraping
          const syncResult = await triggerScrapingEngine(schedule, supabase);

          // Check for price changes
          const priceAlerts = await checkPriceChanges(
            supabase, 
            schedule.settings.priceChangeThreshold || 0.1
          );

          // Detect discontinued products
          const discontinuedProducts = await detectDiscontinuedProducts(supabase);

          // Send notifications if enabled
          await sendNotifications(supabase, schedule, syncResult, priceAlerts, discontinuedProducts);

          // Update schedule with next run time
          const nextRun = calculateNextRun(schedule.frequency, schedule.time_of_day);
          
          await supabase
            .from('sync_schedules')
            .update({
              last_run: new Date().toISOString(),
              next_run: nextRun.toISOString(),
              last_result: {
                status: 'success',
                ...syncResult.details,
                priceAlerts: priceAlerts.length,
                discontinuedProducts: discontinuedProducts.length
              }
            })
            .eq('id', schedule.id);

          results.push({
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            status: 'success',
            ...syncResult.details,
            priceAlerts: priceAlerts.length,
            discontinuedProducts: discontinuedProducts.length
          });

        } catch (error) {
          console.error(`❌ Error processing schedule ${schedule.name}:`, error);
          
          // Update schedule with error
          await supabase
            .from('sync_schedules')
            .update({
              last_run: new Date().toISOString(),
              last_result: {
                status: 'error',
                error: error.message
              }
            })
            .eq('id', schedule.id);

          results.push({
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            status: 'error',
            error: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${results.length} sync schedules`,
          results
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );

    } else if (action === 'run_specific_sync' && scheduleId) {
      // Run a specific schedule immediately
      const { data: schedule, error } = await supabase
        .from('sync_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error) throw error;

      const syncResult = await triggerScrapingEngine(schedule, supabase);
      const priceAlerts = await checkPriceChanges(supabase);
      const discontinuedProducts = await detectDiscontinuedProducts(supabase);

      await sendNotifications(supabase, schedule, syncResult, priceAlerts, discontinuedProducts);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Manual sync completed for ${schedule.name}`,
          details: {
            ...syncResult.details,
            priceAlerts: priceAlerts.length,
            discontinuedProducts: discontinuedProducts.length
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid action specified'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );

  } catch (error) {
    console.error('❌ Sync scheduler error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Automated sync scheduler encountered an error'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});