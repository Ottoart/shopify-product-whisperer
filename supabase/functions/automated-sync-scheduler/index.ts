import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncSchedule {
  id: string;
  name: string;
  suppliers: string[];
  collections: string[];
  frequency: string;
  time_of_day: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  auto_approve: boolean;
  markup_percentage: number;
  settings: Record<string, any>;
}

interface PriceAlert {
  product_id: string;
  old_price: number;
  new_price: number;
  change_percentage: number;
  supplier: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, schedule_id } = await req.json();

    if (action === 'run_due_syncs') {
      // Get all active schedules that are due to run
      const { data: schedules, error: schedulesError } = await supabase
        .from('sync_schedules')
        .select('*')
        .eq('is_active', true)
        .lte('next_run_at', new Date().toISOString());

      if (schedulesError) {
        throw new Error(`Failed to fetch schedules: ${schedulesError.message}`);
      }

      const results = [];

      for (const schedule of schedules || []) {
        try {
          // Trigger scraping engine for each due schedule
          const scrapingResult = await triggerScrapingEngine(schedule, supabase);
          
          // Check for price changes
          const priceAlerts = await checkPriceChanges(supabase, 10); // 10% threshold
          
          // Detect discontinued products
          const discontinuedProducts = await detectDiscontinuedProducts(supabase);
          
          // Send notifications
          await sendNotifications(supabase, schedule, scrapingResult, priceAlerts, discontinuedProducts);
          
          // Update schedule's next run time
          const nextRun = calculateNextRun(schedule.frequency, schedule.time_of_day);
          
          await supabase
            .from('sync_schedules')
            .update({
              last_run_at: new Date().toISOString(),
              next_run_at: nextRun.toISOString()
            })
            .eq('id', schedule.id);

          results.push({
            schedule_id: schedule.id,
            status: 'completed',
            ...scrapingResult
          });

        } catch (error) {
          console.error(`Error running schedule ${schedule.id}:`, error);
          results.push({
            schedule_id: schedule.id,
            status: 'error',
            error: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${schedules?.length || 0} due schedules`,
          results
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'run_specific_sync' && schedule_id) {
      // Run a specific schedule immediately
      const { data: schedule, error: scheduleError } = await supabase
        .from('sync_schedules')
        .select('*')
        .eq('id', schedule_id)
        .single();

      if (scheduleError || !schedule) {
        throw new Error(`Schedule not found: ${schedule_id}`);
      }

      const result = await triggerScrapingEngine(schedule, supabase);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Triggered sync for schedule: ${schedule.name}`,
          result
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else {
      throw new Error('Invalid action or missing parameters');
    }

  } catch (error) {
    console.error('Error in automated-sync-scheduler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function calculateNextRun(frequency: string, timeOfDay: string): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (frequency) {
    case 'hourly':
      nextRun.setHours(now.getHours() + 1);
      break;
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    default:
      nextRun.setDate(nextRun.getDate() + 1); // Default to daily
  }
  
  return nextRun;
}

async function triggerScrapingEngine(schedule: SyncSchedule, supabase: any) {
  try {
    const { data, error } = await supabase.functions.invoke('enhanced-scraping-engine', {
      body: {
        suppliers: schedule.suppliers,
        collections: schedule.collections,
        maxProducts: schedule.settings?.maxProducts || 100,
        autoApprove: schedule.auto_approve,
        markupPercentage: schedule.markup_percentage
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error triggering scraping engine:', error);
    throw error;
  }
}

async function checkPriceChanges(supabase: any, threshold: number = 10): Promise<PriceAlert[]> {
  try {
    // Get recent price changes from price_history table
    const { data: priceChanges, error } = await supabase
      .from('price_history')
      .select(`
        product_id,
        old_price,
        new_price,
        change_percentage,
        supplier,
        created_at
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .gte('change_percentage', threshold); // Above threshold

    if (error) {
      console.error('Error checking price changes:', error);
      return [];
    }

    return priceChanges || [];
  } catch (error) {
    console.error('Error in checkPriceChanges:', error);
    return [];
  }
}

async function detectDiscontinuedProducts(supabase: any): Promise<string[]> {
  try {
    // Find products that haven't been updated in the last 7 days
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: products, error } = await supabase
      .from('store_products')
      .select('id, name, supplier')
      .lt('last_scraped_at', cutoffDate)
      .eq('status', 'active');

    if (error) {
      console.error('Error detecting discontinued products:', error);
      return [];
    }

    // Mark as discontinued
    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      
      await supabase
        .from('store_products')
        .update({ status: 'discontinued' })
        .in('id', productIds);

      return productIds;
    }

    return [];
  } catch (error) {
    console.error('Error in detectDiscontinuedProducts:', error);
    return [];
  }
}

async function sendNotifications(
  supabase: any,
  schedule: SyncSchedule,
  scrapingResult: any,
  priceAlerts: PriceAlert[],
  discontinuedProducts: string[]
): Promise<void> {
  try {
    const notifications = [];

    // Scraping completion notification
    notifications.push({
      schedule_id: schedule.id,
      type: 'success',
      title: 'Sync Completed',
      message: `${schedule.name}: Found ${scrapingResult.details?.totalProductsFound || 0} products, ${scrapingResult.details?.inserted || 0} new, ${scrapingResult.details?.updated || 0} updated`,
      data: scrapingResult
    });

    // Price change notifications
    if (priceAlerts.length > 0) {
      notifications.push({
        schedule_id: schedule.id,
        type: 'price_change',
        title: 'Significant Price Changes',
        message: `${priceAlerts.length} products have significant price changes`,
        data: { price_alerts: priceAlerts }
      });
    }

    // Discontinued product notifications
    if (discontinuedProducts.length > 0) {
      notifications.push({
        schedule_id: schedule.id,
        type: 'warning',
        title: 'Products Discontinued',
        message: `${discontinuedProducts.length} products marked as discontinued due to lack of updates`,
        data: { discontinued_products: discontinuedProducts }
      });
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error } = await supabase
        .from('sync_notifications')
        .insert(notifications);

      if (error) {
        console.error('Error inserting notifications:', error);
      }
    }
  } catch (error) {
    console.error('Error in sendNotifications:', error);
  }
}