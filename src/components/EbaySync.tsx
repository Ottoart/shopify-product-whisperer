import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Loader, CheckCircle, Store, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EbaySyncProps {
  onProductsUpdated: () => void;
}

export const EbaySync = ({ onProductsUpdated }: EbaySyncProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [syncActiveOnly, setSyncActiveOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load sync settings on component mount
  useEffect(() => {
    loadSyncSettings();
  }, []);

  const loadSyncSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('sync_settings')
        .select('sync_active_only')
        .eq('platform', 'ebay')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (settings) {
        setSyncActiveOnly(settings.sync_active_only);
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSyncSettings = async (activeOnly: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('sync_settings')
        .upsert({
          user_id: user.id,
          platform: 'ebay',
          sync_active_only: activeOnly,
          last_preference_update: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        });
      
      setSyncActiveOnly(activeOnly);
      
      toast({
        title: "Settings Updated",
        description: `eBay sync will now include ${activeOnly ? 'active products only' : 'all products'}`,
      });
    } catch (error) {
      console.error('Error updating sync settings:', error);
      toast({
        title: "Settings Update Failed",
        description: "Failed to update sync preferences",
        variant: "destructive",
      });
    }
  };

  const handleImportFromEbay = async () => {
    setIsImporting(true);
    
    try {
      // Pass sync settings to the function
      const { data, error } = await supabase.functions.invoke('sync-ebay-products', {
        body: { 
          syncActiveOnly: syncActiveOnly 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setLastSync(new Date());
      setSyncedCount(data.productsSynced || 0);
      onProductsUpdated();
      
      const filterMessage = syncActiveOnly ? ' (active products only)' : ' (all products)';
      
      toast({
        title: "eBay Sync Successful",
        description: data.message || `Successfully synced ${data.productsSynced || 0} products from eBay${filterMessage}`,
      });

    } catch (error: any) {
      console.error('eBay sync error:', error);
      toast({
        title: "eBay Sync Failed",
        description: error.message || "Failed to sync products from eBay",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle>eBay Integration</CardTitle>
            <CardDescription>
              Sync products directly from your eBay store
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sync Settings */}
        {!loading && (
          <div className="space-y-3 p-3 bg-secondary/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Sync Preferences</Label>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sync-active-only" className="text-sm">Active products only</Label>
                <p className="text-xs text-muted-foreground">
                  {syncActiveOnly 
                    ? "Sync only products with available inventory" 
                    : "Sync all products including inactive ones"
                  }
                </p>
              </div>
              <Switch
                id="sync-active-only"
                checked={syncActiveOnly}
                onCheckedChange={updateSyncSettings}
                disabled={isImporting}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
            {lastSync && (
              <span className="text-xs text-muted-foreground">
                Last sync: {lastSync.toLocaleString()}
              </span>
            )}
            {syncedCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {syncedCount} products synced
              </Badge>
            )}
          </div>
        </div>

        {/* Import Action */}
        <Button
          onClick={handleImportFromEbay}
          disabled={isImporting}
          className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
        >
          {isImporting ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isImporting ? 'Syncing eBay Products...' : 'Sync eBay Products'}
        </Button>

        {/* Reconnect Alert */}
        <Alert className="border-destructive bg-destructive/10">
          <Zap className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs text-destructive">
            <strong>⚠️ eBay orders not working:</strong> Your eBay connection lacks required permissions. 
            <br />
            <Button 
              size="sm" 
              variant="destructive" 
              className="mt-2"
              onClick={() => window.open('/settings', '_blank')}
            >
              Reconnect eBay Store
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};