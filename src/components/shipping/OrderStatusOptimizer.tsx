import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OptimizationResult {
  success: boolean;
  message: string;
  breakdown?: {
    oldOrdersMarkedDelivered: number;
    shopifyStatusUpdates: number;
    recentOrdersUpdated: number;
    totalUpdated: number;
  };
  totalUpdated?: number;
  results?: Array<{
    store: string;
    synced?: number;
    statusUpdated?: number;
    error?: string;
    details?: string;
  }>;
}

export function OrderStatusOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false);
  const [isBulkCleaning, setIsBulkCleaning] = useState(false);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  const handleBulkCleanup = async () => {
    setIsBulkCleaning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/bulk-update-order-statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceUpdateRecent: false // Change to true if you want to force update recent orders
        })
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Bulk Cleanup Complete",
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Bulk cleanup failed');
      }
    } catch (error: any) {
      console.error('Bulk cleanup error:', error);
      toast({
        title: "Bulk Cleanup Failed",
        description: error.message || 'Failed to clean up order statuses',
        variant: "destructive",
      });
    } finally {
      setIsBulkCleaning(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsUpdatingStatuses(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/update-order-statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Status Update Complete",
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Status update failed');
      }
    } catch (error: any) {
      console.error('Status update error:', error);
      toast({
        title: "Status Update Failed",
        description: error.message || 'Failed to update order statuses',
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatuses(false);
    }
  };

  const handleFullOptimization = async () => {
    setIsOptimizing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // First run the enhanced sync with status updates
      const syncResponse = await fetch(`https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/sync-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      const syncResult = await syncResponse.json();

      if (syncResult.success) {
        // Then run bulk cleanup for old orders
        const cleanupResponse = await fetch(`https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/bulk-update-order-statuses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            forceUpdateRecent: false
          })
        });

        const cleanupResult = await cleanupResponse.json();
        
        // Combine results
        const totalUpdated = (syncResult.results?.reduce((sum: number, r: any) => sum + (r.statusUpdated || 0), 0) || 0) + 
                           (cleanupResult.breakdown?.totalUpdated || 0);

        setLastResult({
          success: true,
          message: `Full optimization completed! Updated ${totalUpdated} order statuses`,
          totalUpdated,
          results: syncResult.results,
          breakdown: cleanupResult.breakdown
        });

        toast({
          title: "Full Optimization Complete",
          description: `Successfully updated ${totalUpdated} order statuses`,
        });
      } else {
        throw new Error(syncResult.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Full optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: error.message || 'Failed to optimize order statuses',
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Order Status Optimizer
        </CardTitle>
        <CardDescription>
          Fix stale order statuses and sync with current marketplace data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleFullOptimization}
            disabled={isOptimizing}
            variant="default"
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Full Optimization
          </Button>

          <Button
            onClick={handleStatusUpdate}
            disabled={isUpdatingStatuses}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isUpdatingStatuses ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update Statuses
          </Button>

          <Button
            onClick={handleBulkCleanup}
            disabled={isBulkCleaning}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isBulkCleaning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Bulk Cleanup
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Full Optimization:</strong> Syncs new orders + updates all existing statuses + cleans up old orders</p>
          <p><strong>Update Statuses:</strong> Only updates existing order statuses from marketplace</p>
          <p><strong>Bulk Cleanup:</strong> Marks old orders (60+ days) as delivered and handles edge cases</p>
        </div>

        {lastResult && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">Last Result</span>
              </div>
              
              <p className="text-sm">{lastResult.message}</p>
              
              {lastResult.breakdown && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Badge variant="secondary" className="text-center">
                    Old: {lastResult.breakdown.oldOrdersMarkedDelivered}
                  </Badge>
                  <Badge variant="secondary" className="text-center">
                    Shopify: {lastResult.breakdown.shopifyStatusUpdates}
                  </Badge>
                  <Badge variant="secondary" className="text-center">
                    Recent: {lastResult.breakdown.recentOrdersUpdated}
                  </Badge>
                  <Badge variant="default" className="text-center">
                    Total: {lastResult.breakdown.totalUpdated}
                  </Badge>
                </div>
              )}

              {lastResult.results && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Store Results:</p>
                  {lastResult.results.map((result, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded">
                      <strong>{result.store}:</strong> {result.details || result.error || `Synced: ${result.synced || 0}, Updated: ${result.statusUpdated || 0}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}