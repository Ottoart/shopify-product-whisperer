import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Settings } from 'lucide-react';

interface StoreConfigProps {
  storeUrl: string;
  onStoreUrlChange: (url: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const StoreConfig = ({ storeUrl, onStoreUrlChange, apiKey, onApiKeyChange }: StoreConfigProps) => {
  const [tempUrl, setTempUrl] = useState(storeUrl);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSave = () => {
    onStoreUrlChange(tempUrl);
    onApiKeyChange(tempApiKey);
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
        
        <Button 
          onClick={handleSave} 
          className="w-full bg-gradient-primary"
          disabled={tempUrl === storeUrl && tempApiKey === apiKey}
        >
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};