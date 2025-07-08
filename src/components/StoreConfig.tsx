import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Settings } from 'lucide-react';

interface StoreConfigProps {
  storeUrl: string;
  onStoreUrlChange: (url: string) => void;
}

export const StoreConfig = ({ storeUrl, onStoreUrlChange }: StoreConfigProps) => {
  const [tempUrl, setTempUrl] = useState(storeUrl);

  const handleSave = () => {
    onStoreUrlChange(tempUrl);
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
        
        <Button 
          onClick={handleSave} 
          className="w-full bg-gradient-primary"
          disabled={tempUrl === storeUrl}
        >
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};