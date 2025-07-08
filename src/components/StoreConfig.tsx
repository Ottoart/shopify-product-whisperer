import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StoreConfigProps {
  storeUrl: string;
  onStoreUrlChange: (url: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const StoreConfig = ({ storeUrl, onStoreUrlChange, apiKey, onApiKeyChange }: StoreConfigProps) => {
  const [tempUrl, setTempUrl] = useState(storeUrl);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Clean the URL to extract just the domain
      const cleanUrl = tempUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Update local state
      onStoreUrlChange(tempUrl);
      onApiKeyChange(tempApiKey);
      
      // Attempt to save to Supabase (for future implementation)
      const { data, error } = await supabase.functions.invoke('update-store-config', {
        body: {
          shopifyDomain: cleanUrl,
          shopifyAccessToken: tempApiKey
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Configuration Saved",
        description: "Store settings have been updated successfully.",
      });
      
    } catch (error: any) {
      console.error('Error saving store config:', error);
      toast({
        title: "Save Failed", 
        description: "Settings saved locally, but you'll need to manually add Supabase secrets.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
            <CardTitle>Store Configuration</CardTitle>
            <CardDescription>
              Configure your Shopify store settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store-url">Shopify Store URL</Label>
          <Input
            id="store-url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://your-store.myshopify.com"
          />
          <p className="text-xs text-muted-foreground">
            Enter your Shopify store URL to generate correct product links
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Shopify API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="Enter your Shopify API key"
          />
          <p className="text-xs text-muted-foreground">
            Your Shopify API key for importing/exporting products
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-primary"
            disabled={(tempUrl === storeUrl && tempApiKey === apiKey) || isSaving}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
          
          <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Manual Setup Required:</p>
            <p>After saving, add these secrets in Supabase:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>SHOPIFY_DOMAIN: {tempUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'your-store.myshopify.com'}</li>
              <li>SHOPIFY_ACCESS_TOKEN: {tempApiKey ? '***' : 'your-access-token'}</li>
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 p-0 text-xs hover:text-accent"
              onClick={() => window.open('https://supabase.com/dashboard/project/751c8744-5cc2-4126-b021-cefc67bc436e/settings/functions', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Supabase Secrets
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};