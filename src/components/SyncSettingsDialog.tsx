import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Platform {
  name: string;
  displayName: string;
  description: string;
}

const PLATFORMS: Platform[] = [
  {
    name: 'shopify',
    displayName: 'Shopify',
    description: 'Sync products from your Shopify store'
  },
  {
    name: 'ebay',
    displayName: 'eBay',
    description: 'Sync products from your eBay store'
  }
];

export const SyncSettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('sync_settings')
        .select('platform, sync_active_only');
      
      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.platform] = setting.sync_active_only;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Set defaults for platforms that don't have settings yet
      PLATFORMS.forEach(platform => {
        if (!(platform.name in settingsMap)) {
          settingsMap[platform.name] = true; // Default to active only
        }
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading sync settings:', error);
      toast({
        title: "Failed to load settings",
        description: "Could not load sync preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const upsertPromises = Object.entries(settings).map(([platform, activeOnly]) => 
        supabase
          .from('sync_settings')
          .upsert({
            user_id: user.id,
            platform,
            sync_active_only: activeOnly,
            last_preference_update: new Date().toISOString()
          }, {
            onConflict: 'user_id,platform'
          })
      );

      await Promise.all(upsertPromises);
      
      toast({
        title: "Settings saved",
        description: "Your sync preferences have been updated",
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving sync settings:', error);
      toast({
        title: "Failed to save settings",
        description: "Could not update sync preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (platform: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [platform]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Sync Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sync Preferences</DialogTitle>
          <DialogDescription>
            Configure how products are synced from each marketplace
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4">
            {PLATFORMS.map(platform => (
              <Card key={platform.name} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-secondary rounded w-1/3"></div>
                  <div className="h-3 bg-secondary rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-secondary rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {PLATFORMS.map(platform => (
              <Card key={platform.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{platform.displayName}</CardTitle>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={`${platform.name}-active-only`} className="text-sm font-medium">
                        Sync active products only
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {settings[platform.name] 
                          ? "Only sync products with available inventory" 
                          : "Sync all products including inactive ones"
                        }
                      </p>
                    </div>
                    <Switch
                      id={`${platform.name}-active-only`}
                      checked={settings[platform.name] || false}
                      onCheckedChange={(checked) => updateSetting(platform.name, checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveSettings} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};