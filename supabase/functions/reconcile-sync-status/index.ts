import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

// Enhanced error handling and recovery utilities
interface ErrorContext {
  correlationId: string;
  operation: string;
  component: string;
  metadata?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

class EdgeFunctionError extends Error {
  public readonly correlationId: string;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    context: Partial<ErrorContext>,
    originalError?: Error,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.correlationId = context.correlationId || crypto.randomUUID();
    this.context = {
      correlationId: this.correlationId,
      operation: context.operation || 'unknown',
      component: context.component || 'edge-function',
      metadata: context.metadata || {},
      userId: context.userId,
      timestamp: new Date().toISOString(),
    };
    this.originalError = originalError;
    this.isRetryable = isRetryable;
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  context: ErrorContext
): Promise<T> {
  let lastError: Error;
  let attempt = 0;

  while (attempt < config.maxAttempts) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        console.log(`Operation succeeded after ${attempt} retries`, {
          correlationId: context.correlationId,
          operation: context.operation,
          attempts: attempt + 1
        });
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      attempt++;

      const isRetryable = isRetryableError(error as Error, config.retryableErrors);
      
      if (attempt >= config.maxAttempts || !isRetryable) {
        throw new EdgeFunctionError(
          `Operation failed after ${attempt} attempts: ${lastError.message}`,
          context,
          lastError,
          false
        );
      }

      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        correlationId: context.correlationId,
        operation: context.operation,
        error: lastError.message,
        nextDelay: delay
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

function isRetryableError(error: Error, retryableErrors?: string[]): boolean {
  const defaultRetryableErrors = [
    'fetch failed',
    'network error',
    'timeout',
    'connection refused',
    'rate limit',
    'service unavailable',
    'internal server error'
  ];

  const errorsToCheck = retryableErrors || defaultRetryableErrors;
  const errorMessage = error.message.toLowerCase();
  
  return errorsToCheck.some(retryableError => 
    errorMessage.includes(retryableError.toLowerCase())
  );
}

async function executeWithTransaction<T>(
  supabase: any,
  operations: Array<() => Promise<any>>,
  context: ErrorContext
): Promise<T[]> {
  const results: T[] = [];
  const rollbackOperations: Array<() => Promise<void>> = [];

  console.log(`Starting transaction with ${operations.length} operations`, {
    correlationId: context.correlationId,
    operationCount: operations.length
  });

  try {
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      console.log(`Executing operation ${i + 1}/${operations.length}`, {
        correlationId: context.correlationId
      });

      const result = await operation();
      results.push(result);
    }

    console.log('Transaction completed successfully', {
      correlationId: context.correlationId,
      operationsExecuted: operations.length
    });

    return results;

  } catch (error) {
    console.error('Transaction failed, initiating rollback', {
      correlationId: context.correlationId,
      error: error instanceof Error ? error.message : String(error)
    });

    // Execute rollback operations in reverse order
    for (const rollbackOp of rollbackOperations.reverse()) {
      try {
        await rollbackOp();
      } catch (rollbackError) {
        console.error('Rollback operation failed', {
          correlationId: context.correlationId,
          rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
        });
      }
    }

    throw new EdgeFunctionError(
      `Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
      context,
      error instanceof Error ? error : new Error(String(error)),
      false
    );
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncConflict {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution_action?: string;
}

interface ReconciliationResult {
  success: boolean;
  actualProductCount: number;
  conflicts_detected: SyncConflict[];
  conflicts_resolved: SyncConflict[];
  final_status: any;
  recommendations: string[];
  message: string;
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

    console.log(`Enhanced reconciliation started for user ${user.id}, marketplace: ${marketplace}`);

    // Get actual product count from database
    const { count: actualProductCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get current sync statuses
    const [marketplaceResult, shopifyResult] = await Promise.all([
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
        .maybeSingle()
    ]);

    const currentStatus = marketplaceResult.data;
    const shopifyStatus = shopifyResult.data;
    const actualCount = actualProductCount || 0;

    const conflicts: SyncConflict[] = [];
    const resolved: SyncConflict[] = [];
    const recommendations: string[] = [];

    // 1. Detect stuck syncs (>30 minutes with in_progress status)
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    if (shopifyStatus?.sync_status === 'in_progress' && shopifyStatus.last_sync_at) {
      const lastSyncTime = new Date(shopifyStatus.last_sync_at);
      if (lastSyncTime < thirtyMinutesAgo) {
        conflicts.push({
          type: 'stuck_sync',
          description: `Sync has been in progress for ${Math.round((now.getTime() - lastSyncTime.getTime()) / (1000 * 60))} minutes without progress`,
          severity: 'high',
          resolved: false
        });
      }
    }

    // 2. Detect state conflicts between tables
    if (currentStatus && shopifyStatus) {
      if (currentStatus.sync_status !== shopifyStatus.sync_status) {
        conflicts.push({
          type: 'status_mismatch',
          description: `Marketplace status (${currentStatus.sync_status}) differs from Shopify status (${shopifyStatus.sync_status})`,
          severity: 'medium',
          resolved: false
        });
      }
    }

    // 3. Detect GraphQL bulk operation abandonment
    if (currentStatus?.sync_settings && typeof currentStatus.sync_settings === 'object') {
      const syncSettings = currentStatus.sync_settings as any;
      if (syncSettings.bulk_operation_id && syncSettings.sync_method === 'graphql') {
        // Check if bulk operation is abandoned (status stuck but no recent activity)
        if (shopifyStatus?.sync_status === 'in_progress' && shopifyStatus.last_sync_at) {
          const lastSync = new Date(shopifyStatus.last_sync_at);
          if (lastSync < thirtyMinutesAgo) {
            conflicts.push({
              type: 'abandoned_bulk_operation',
              description: `GraphQL bulk operation ${syncSettings.bulk_operation_id} appears abandoned`,
              severity: 'high',
              resolved: false
            });
          }
        }
      }
    }

    // 4. Detect pagination inconsistencies
    if (shopifyStatus?.last_page_info && shopifyStatus.sync_status !== 'in_progress') {
      conflicts.push({
        type: 'stale_pagination',
        description: 'Pagination data exists but sync is not in progress',
        severity: 'medium',
        resolved: false
      });
    }

    // 5. Detect product count mismatches
    const recordedCount = Math.max(
      currentStatus?.products_synced || 0,
      shopifyStatus?.products_synced || 0
    );
    if (Math.abs(actualCount - recordedCount) > 5) { // Allow small variance
      conflicts.push({
        type: 'count_mismatch',
        description: `Database has ${actualCount} products, but sync records show ${recordedCount}`,
        severity: 'medium',
        resolved: false
      });
    }

    // RESOLUTION LOGIC
    let updatedMarketplaceStatus = currentStatus;
    let updatedShopifyStatus = shopifyStatus;

    // Resolve conflicts
    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'stuck_sync':
          console.log('Resolving stuck sync...');
          // Reset shopify status but preserve progress
          updatedShopifyStatus = {
            ...shopifyStatus,
            sync_status: actualCount > 0 ? 'paused' : 'idle',
            last_sync_at: new Date().toISOString()
          };
          
          // Update shopify_sync_status
          await supabase
            .from('shopify_sync_status')
            .upsert(updatedShopifyStatus, { onConflict: 'user_id' });

          conflict.resolved = true;
          conflict.resolution_action = `Reset sync status from stuck 'in_progress' to '${updatedShopifyStatus.sync_status}'`;
          resolved.push(conflict);
          recommendations.push('Sync was stuck and has been reset. You can now resume or restart synchronization.');
          break;

        case 'status_mismatch':
          console.log('Resolving status mismatch...');
          // Use the more accurate status based on actual data
          const resolvedStatus = actualCount > 0 ? 
            (shopifyStatus?.last_page_info ? 'paused' : 'completed') : 
            'pending';
          
          updatedMarketplaceStatus = {
            ...currentStatus,
            sync_status: resolvedStatus,
            products_synced: actualCount,
            last_sync_at: new Date().toISOString()
          };

          conflict.resolved = true;
          conflict.resolution_action = `Aligned statuses to '${resolvedStatus}' based on actual data`;
          resolved.push(conflict);
          break;

        case 'abandoned_bulk_operation':
          console.log('Cleaning up abandoned GraphQL bulk operation...');
          const cleanedSettings = { ...(currentStatus?.sync_settings as any) };
          delete cleanedSettings.bulk_operation_id;
          cleanedSettings.sync_method = 'rest'; // Fall back to REST API

          updatedMarketplaceStatus = {
            ...currentStatus,
            sync_settings: cleanedSettings,
            sync_status: actualCount > 0 ? 'paused' : 'pending'
          };

          updatedShopifyStatus = {
            ...shopifyStatus,
            sync_status: actualCount > 0 ? 'paused' : 'idle'
          };

          conflict.resolved = true;
          conflict.resolution_action = 'Cleared abandoned bulk operation ID and reset to REST API method';
          resolved.push(conflict);
          recommendations.push('GraphQL bulk operation was abandoned. Sync method reset to REST API for reliability.');
          break;

        case 'stale_pagination':
          console.log('Clearing stale pagination data...');
          updatedShopifyStatus = {
            ...shopifyStatus,
            last_page_info: null,
            sync_status: actualCount > 0 ? 'completed' : 'idle'
          };

          await supabase
            .from('shopify_sync_status')
            .upsert(updatedShopifyStatus, { onConflict: 'user_id' });

          conflict.resolved = true;
          conflict.resolution_action = 'Cleared stale pagination data';
          resolved.push(conflict);
          break;

        case 'count_mismatch':
          console.log('Reconciling product counts...');
          updatedMarketplaceStatus = {
            ...currentStatus,
            products_synced: actualCount,
            active_products_synced: actualCount
          };

          conflict.resolved = true;
          conflict.resolution_action = `Updated recorded count to match database: ${actualCount} products`;
          resolved.push(conflict);
          break;
      }
    }

    // Calculate final status
    const isComplete = actualCount > 0 && 
                      !updatedShopifyStatus?.last_page_info && 
                      updatedShopifyStatus?.sync_status !== 'in_progress';

    const finalStatus = {
      user_id: user.id,
      marketplace: marketplace,
      products_synced: actualCount,
      total_products_found: Math.max(
        actualCount, 
        currentStatus?.total_products_found || 0,
        shopifyStatus?.total_products_found || 0
      ),
      sync_status: isComplete ? 'completed' : 
                   (actualCount > 0 ? 'paused' : 'pending'),
      last_sync_at: new Date().toISOString(),
      error_message: null,
      sync_settings: updatedMarketplaceStatus?.sync_settings || {},
      active_products_synced: actualCount,
      inactive_products_skipped: currentStatus?.inactive_products_skipped || 0
    };

    // Update marketplace sync status
    const { error: updateError } = await supabase
      .from('marketplace_sync_status')
      .upsert(finalStatus, {
        onConflict: 'user_id,marketplace'
      });

    if (updateError) {
      throw new Error(`Failed to update sync status: ${updateError.message}`);
    }

    // Add general recommendations
    if (conflicts.length === 0) {
      recommendations.push('No conflicts detected. Sync status is consistent.');
    }
    
    if (actualCount > 0 && finalStatus.sync_status === 'paused') {
      recommendations.push('You can resume synchronization from where it left off.');
    } else if (actualCount === 0) {
      recommendations.push('No products found. Consider starting a fresh synchronization.');
    }

    console.log(`Enhanced reconciliation completed: ${resolved.length}/${conflicts.length} conflicts resolved`);

    const result: ReconciliationResult = {
      success: true,
      actualProductCount: actualCount,
      conflicts_detected: conflicts,
      conflicts_resolved: resolved,
      final_status: finalStatus,
      recommendations,
      message: `Enhanced reconciliation completed: ${resolved.length}/${conflicts.length} conflicts resolved, ${actualCount} products confirmed`
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced sync reconciliation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      conflicts_detected: [],
      conflicts_resolved: [],
      recommendations: ['Manual intervention may be required due to reconciliation error']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});