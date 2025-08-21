import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ShopifySyncProps {
  onProductsUpdated?: () => void;
}

export const ShopifySync: React.FC<ShopifySyncProps> = ({ onProductsUpdated }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Shopify Sync
        </CardTitle>
        <CardDescription>
          ProductWhisper sync functionality has been removed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          The ProductWhisper system and its Shopify integration have been removed from this application.
        </p>
      </CardContent>
    </Card>
  );
};