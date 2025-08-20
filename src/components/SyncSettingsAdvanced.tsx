import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Settings, AlertTriangle, Zap, Shield } from 'lucide-react';

interface SyncSettings {
  batch_size: number;
  max_pages: number;
  early_termination_threshold: number;
  rate_limit_delay: number;
  auto_recovery: boolean;
  validation_checks: boolean;
  store_size_category: 'small' | 'medium' | 'large' | 'enterprise';
}

const defaultSettings: SyncSettings = {
  batch_size: 250,
  max_pages: 500,
  early_termination_threshold: 10,
  rate_limit_delay: 500,
  auto_recovery: true,
  validation_checks: true,
  store_size_category: 'medium'
};

const storeSizeConfigs = {
  small: { maxPages: 100, batchSize: 100, delay: 300 },
  medium: { maxPages: 500, batchSize: 250, delay: 500 },
  large: { maxPages: 1000, batchSize: 250, delay: 750 },
  enterprise: { maxPages: 2000, batchSize: 200, delay: 1000 }
};

export function SyncSettingsAdvanced() {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SyncSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      loadSettings();
    }
  }, [isOpen, session?.user?.id]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sync_settings')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('platform', 'shopify')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.advanced_settings) {
        setSettings({ ...defaultSettings, ...data.advanced_settings });
      }
    } catch (error: any) {
      toast({
        title: "Failed to Load Settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('sync_settings')
        .upsert({
          user_id: session.user.id,
          platform: 'shopify',
          advanced_settings: settings
        }, {
          onConflict: 'user_id,platform'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Advanced sync settings have been updated successfully.",
      });
      
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to Save Settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStoreSizeChange = (size: string) => {
    const config = storeSizeConfigs[size as keyof typeof storeSizeConfigs];
    setSettings(prev => ({
      ...prev,
      store_size_category: size as any,
      max_pages: config.maxPages,
      batch_size: config.batchSize,
      rate_limit_delay: config.delay
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Advanced Sync Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Sync Configuration
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Store Size Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Store Size Optimization
                </CardTitle>
                <CardDescription>
                  Choose your store size for optimal sync performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={settings.store_size_category} 
                  onValueChange={handleStoreSizeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (0-1,000 products)</SelectItem>
                    <SelectItem value="medium">Medium (1,000-10,000 products)</SelectItem>
                    <SelectItem value="large">Large (10,000-50,000 products)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (50,000+ products)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Batch Size: {settings.batch_size} products</Label>
                  <Slider
                    value={[settings.batch_size]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, batch_size: value }))}
                    min={50}
                    max={250}
                    step={25}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Max Pages: {settings.max_pages}</Label>
                  <Slider
                    value={[settings.max_pages]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, max_pages: value }))}
                    min={100}
                    max={2000}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Rate Limit Delay: {settings.rate_limit_delay}ms</Label>
                  <Slider
                    value={[settings.rate_limit_delay]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, rate_limit_delay: value }))}
                    min={100}
                    max={2000}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reliability Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Reliability & Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Empty Pages Before Stop: {settings.early_termination_threshold}</Label>
                  <Slider
                    value={[settings.early_termination_threshold]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, early_termination_threshold: value }))}
                    min={5}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-recovery">Auto Recovery</Label>
                  <Switch
                    id="auto-recovery"
                    checked={settings.auto_recovery}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_recovery: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="validation-checks">Post-Sync Validation</Label>
                  <Switch
                    id="validation-checks"
                    checked={settings.validation_checks}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, validation_checks: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">Performance Impact</p>
                    <p className="text-orange-700 mt-1">
                      Higher batch sizes and lower delays increase sync speed but may trigger rate limits. 
                      Adjust based on your Shopify plan's API limits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}