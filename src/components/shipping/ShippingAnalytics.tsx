import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Package, DollarSign, Clock, TrendingUp, RefreshCw, ChevronDown, Store } from "lucide-react";

export function ShippingAnalytics() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [storeConfigs, setStoreConfigs] = useState<any[]>([]);

  useEffect(() => {
    fetchStoreConfigs();
  }, []);

  const fetchStoreConfigs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('store_configurations')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setStoreConfigs(data || []);
    } catch (error) {
      console.error('Error fetching store configs:', error);
    }
  };

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-orders');
      if (response.error) throw response.error;
      
      toast({
        title: "Sync initiated",
        description: "Updating analytics data from all stores...",
      });
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSpecificStore = async (storeName: string) => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-orders', {
        body: { storeName }
      });
      if (response.error) throw response.error;
      
      toast({
        title: "Store sync initiated",
        description: `Updating analytics from ${storeName}...`,
      });
    } catch (error) {
      console.error('Error syncing store:', error);
      toast({
        title: "Sync failed",
        description: `Failed to sync ${storeName}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Shipping Analytics</h1>
          <p className="text-muted-foreground">See where your shipping dollars go and how efficient you are</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {storeConfigs.length} Active Stores
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={syncing} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Update All Stores
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSyncOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Stores
              </DropdownMenuItem>
              <div className="px-2 py-1 text-xs text-muted-foreground border-t mt-1">
                Individual Stores:
              </div>
              {storeConfigs.map((store) => (
                <DropdownMenuItem 
                  key={store.id} 
                  onClick={() => handleSyncSpecificStore(store.store_name)}
                  className="pl-6"
                >
                  <Store className="h-4 w-4 mr-2" />
                  {store.store_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Performance Dashboard
          </CardTitle>
          <CardDescription>Real-time insights from all connected stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">124</div>
                <div className="text-sm text-muted-foreground">Orders Shipped This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">$8.90</div>
                <div className="text-sm text-muted-foreground">Avg Cost/Order</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">2.3</div>
                <div className="text-sm text-muted-foreground">Avg Days to Ship</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">96.2%</div>
                <div className="text-sm text-muted-foreground">On-Time Delivery</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Carriers by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>UPS Ground</span>
                    <Badge>45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>FedEx Express</span>
                    <Badge>32%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>USPS Priority</span>
                    <Badge>23%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Problem Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                    <div className="font-medium text-red-800">18% of FedEx shipments delayed</div>
                    <div className="text-sm text-red-600">Consider switching to UPS for time-sensitive orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}