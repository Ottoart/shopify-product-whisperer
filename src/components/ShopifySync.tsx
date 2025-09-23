import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useShopifySync } from "@/hooks/useShopifySync";

export function ShopifySync() {
  const { syncOrders, isLoading } = useShopifySync();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://cdn.shopify.com/s/files/1/0040/3553/2341/files/Shopify_logo_2018.svg" 
            alt="Shopify" 
            className="w-5 h-5"
          />
          Shopify Sync
        </CardTitle>
        <CardDescription>
          Sync your orders from connected Shopify stores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={syncOrders}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync Orders
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}