import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Database, RotateCcw, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function EbayDataCleanup() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const { toast } = useToast();

  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      // Get current data status
      const { count: ebayOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_platform', 'ebay')
        .eq('status', 'awaiting');

      const { count: corruptedOrderItemsCount } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .like('variant_title', '%[object Object]%');

      const { count: recentEbayOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_platform', 'ebay')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: allEbayOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_platform', 'ebay');

      setDataStatus({
        totalEbayOrders: ebayOrdersCount || 0,
        corruptedOrderItems: corruptedOrderItemsCount || 0,
        recentEbayOrders: recentEbayOrdersCount || 0,
        allEbayOrders: allEbayOrdersCount || 0
      });

      console.log('📊 Data analysis:', {
        totalEbayOrders: ebayOrdersCount,
        corruptedOrderItems: corruptedOrderItemsCount,
        recentEbayOrders: recentEbayOrdersCount,
        allEbayOrders: allEbayOrdersCount
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, []);

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-ebay-data');
      
      if (error) throw error;
      
      console.log('🧹 Cleanup results:', data);
      toast({
        title: "Phase 1: Cleanup completed",
        description: `Cleaned ${data.cleaned_products || 0} products and ${data.cleaned_order_items || 0} order items. Found ${data.current_ebay_orders || 0} current orders.`,
      });
      
      // Refresh data analysis
      await analyzeData();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleEbaySync = async () => {
    setIsSyncing(true);
    try {
      console.log('🔄 Starting eBay sync...');
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { storeFilter: 'ebay' } // Fixed parameter name
      });
      
      if (error) throw error;
      
      console.log('🔄 Sync results:', data);
      
      // Phase 2B: Verify sync quality
      await verifySync2B();
      
      toast({
        title: "Phase 2: eBay sync completed",
        description: `Successfully synced orders. Check data quality below.`,
      });
      
      // Refresh data analysis
      await analyzeData();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const verifySync2B = async () => {
    console.log('🔍 Phase 2B: Verifying sync quality...');
    
    try {
      // Check recent orders for variant title quality
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          store_platform,
          created_at,
          order_items (
            id,
            variant_title,
            sku
          )
        `)
        .eq('store_platform', 'ebay')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('🔍 Recent eBay orders (last 24h):', recentOrders);
      
      // Check for corrupted variant titles in recent orders  
      const corruptedRecent = recentOrders?.flatMap(order => 
        order.order_items?.filter(item => 
          item.variant_title && item.variant_title.includes('[object Object]')
        ) || []
      ) || [];
      
      console.log('🚨 Corrupted variant titles in recent orders:', corruptedRecent);
      
      if (corruptedRecent.length > 0) {
        toast({
          title: "⚠️ Phase 2B: Variant titles still corrupted",
          description: `Found ${corruptedRecent.length} corrupted variant titles in recent orders`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Phase 2B: Sync quality verified",
          description: "Recent orders have properly formatted variant titles",
        });
      }
    } catch (error) {
      console.error('Phase 2B verification failed:', error);
      toast({
        title: "Phase 2B verification failed",
        description: "Could not verify sync quality",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOldOrders = async () => {
    try {
      console.log('🗑️ Deleting old eBay orders...');
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('store_platform', 'ebay')
        .lt('created_at', sevenDaysAgo);

      if (error) throw error;

      toast({
        title: "Old orders deleted",
        description: "Removed eBay orders older than 7 days",
      });
      
      await analyzeData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          eBay Data Diagnostics & Management
        </CardTitle>
        <CardDescription>
          Phase 1: Monitor data health, clean corrupted records, and sync fresh orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Status Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            Current Data Status
            <Button
              onClick={analyzeData}
              disabled={isAnalyzing}
              variant="ghost"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
            </Button>
          </h4>
          
          {dataStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataStatus.totalEbayOrders}</div>
                <div className="text-sm text-muted-foreground">Awaiting Orders</div>
                {dataStatus.totalEbayOrders > 10 && (
                  <Badge variant="destructive" className="mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High
                  </Badge>
                )}
                {dataStatus.totalEbayOrders <= 5 && (
                  <Badge variant="secondary" className="mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Expected
                  </Badge>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataStatus.corruptedOrderItems}</div>
                <div className="text-sm text-muted-foreground">Corrupted Items</div>
                {dataStatus.corruptedOrderItems > 0 ? (
                  <Badge variant="destructive" className="mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Needs Fix
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Clean
                  </Badge>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataStatus.recentEbayOrders}</div>
                <div className="text-sm text-muted-foreground">Recent (7d)</div>
                {dataStatus.recentEbayOrders <= 10 ? (
                  <Badge variant="secondary" className="mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Normal
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High
                  </Badge>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dataStatus.allEbayOrders}</div>
                <div className="text-sm text-muted-foreground">Total eBay</div>
                {dataStatus.allEbayOrders > 50 && (
                  <Badge variant="destructive" className="mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Too Many
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium">Phase 1 Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={handleCleanup}
              disabled={isCleaningUp}
              variant="outline"
              className="flex-1"
            >
              {isCleaningUp ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Cleanup Data
            </Button>
            
            <Button
              onClick={handleDeleteOldOrders}
              variant="destructive"
              size="sm"
            >
              Delete Old Orders
            </Button>
            
            <Button
              onClick={handleEbaySync}
              disabled={isSyncing}
              className="flex-1"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Sync eBay
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}