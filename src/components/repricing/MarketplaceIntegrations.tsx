import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Plus,
  ExternalLink,
  Store
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceConfig {
  id: string;
  marketplace: string;
  connected: boolean;
  lastSync: string | null;
  syncStatus: 'pending' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  productsSynced: number;
  logo: string;
}

const MARKETPLACE_CONFIGS = [
  { name: 'Amazon', logo: '🛒', color: 'bg-orange-500' },
  { name: 'Walmart', logo: '🏪', color: 'bg-blue-500' },
  { name: 'eBay', logo: '🏷️', color: 'bg-yellow-500' },
  { name: 'Shopify', logo: '🛍️', color: 'bg-green-500' },
  { name: 'Etsy', logo: '🎨', color: 'bg-purple-500' },
  { name: 'Google Shopping', logo: '🔍', color: 'bg-red-500' },
];

export default function MarketplaceIntegrations() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketplaceStatus();
  }, []);

  const loadMarketplaceStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: syncData, error } = await supabase
        .from('marketplace_sync_status')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const marketplaceData = MARKETPLACE_CONFIGS.map(config => {
        const syncStatus = syncData?.find(s => s.marketplace === config.name);
        return {
          id: syncStatus?.id || crypto.randomUUID(),
          marketplace: config.name,
          connected: !!syncStatus,
          lastSync: syncStatus?.last_sync_at || null,
          syncStatus: (syncStatus?.sync_status || 'pending') as 'pending' | 'syncing' | 'success' | 'error',
          errorMessage: syncStatus?.error_message || undefined,
          productsSynced: syncStatus?.products_synced || 0,
          logo: config.logo
        };
      });

      setMarketplaces(marketplaceData);
    } catch (error) {
      console.error('Error loading marketplace status:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncMarketplace = async (marketplace: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update sync status to syncing
      await supabase
        .from('marketplace_sync_status')
        .upsert({
          user_id: user.id,
          marketplace,
          sync_status: 'syncing',
          last_sync_at: new Date().toISOString()
        });

      setMarketplaces(prev => prev.map(m => 
        m.marketplace === marketplace 
          ? { ...m, syncStatus: 'syncing' as const }
          : m
      ));

      // Simulate sync process
      setTimeout(async () => {
        await supabase
          .from('marketplace_sync_status')
          .upsert({
            user_id: user.id,
            marketplace,
            sync_status: 'success',
            products_synced: Math.floor(Math.random() * 100) + 50
          });

        setMarketplaces(prev => prev.map(m => 
          m.marketplace === marketplace 
            ? { ...m, syncStatus: 'success' as const, productsSynced: Math.floor(Math.random() * 100) + 50 }
            : m
        ));

        toast({
          title: "Sync Complete",
          description: `${marketplace} sync completed successfully`,
        });
      }, 3000);

    } catch (error) {
      console.error('Error syncing marketplace:', error);
      toast({
        title: "Error",
        description: `Failed to sync ${marketplace}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary", text: "Pending" },
      syncing: { variant: "default", text: "Syncing..." },
      success: { variant: "default", text: "Connected" },
      error: { variant: "destructive", text: "Error" }
    } as const;
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return <div>Loading marketplace integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Integrations</h2>
          <p className="text-muted-foreground">Connect and manage your marketplace accounts</p>
        </div>
        <Button onClick={() => window.open('/settings', '_blank')} className="gap-2">
          <Store className="h-4 w-4" />
          Manage Store Connections
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaces.map((marketplace) => (
          <Card key={marketplace.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{marketplace.logo}</div>
                  <CardTitle className="text-lg">{marketplace.marketplace}</CardTitle>
                </div>
                {getStatusBadge(marketplace.syncStatus)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>{marketplace.lastSync ? new Date(marketplace.lastSync).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products Synced:</span>
                  <span>{marketplace.productsSynced}</span>
                </div>
              </div>

              {marketplace.errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{marketplace.errorMessage}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {marketplace.connected ? (
                  <>
                    <Button
                      onClick={() => syncMarketplace(marketplace.marketplace)}
                      variant="outline"
                      size="sm"
                      disabled={marketplace.syncStatus === 'syncing'}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${marketplace.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </>
                ) : (
                  <Button className="w-full">
                    Connect {marketplace.marketplace}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Marketplace Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minMargin">Default Min Margin %</Label>
                <Input id="minMargin" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMargin">Default Max Margin %</Label>
                <Input id="maxMargin" type="number" defaultValue="50" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="taxConsideration">Include Tax in Pricing</Label>
                <Switch id="taxConsideration" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="shippingConsideration">Include Shipping in Pricing</Label>
                <Switch id="shippingConsideration" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logRetention">Log Retention (days)</Label>
                <Input id="logRetention" type="number" defaultValue="30" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button>Save Global Settings</Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Sync Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}