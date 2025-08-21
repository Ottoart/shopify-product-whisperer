import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Store, Settings, Activity, CheckCircle } from "lucide-react";
import { ShopifySync } from "@/components/ShopifySync";
import { EbaySync } from "@/components/EbaySync";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";

export default function ShopifyIntegration() {
  const { store } = useShopifyCredentials();
  const handleProductsUpdated = () => {
    // This will trigger a refetch of products
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Marketplace Integration</h1>
          <p className="text-muted-foreground">Connect and manage your marketplace stores</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shopify Sync Component */}
        <div>
          <ShopifySync onProductsUpdated={handleProductsUpdated} />
        </div>

        {/* eBay Sync Component */}
        <div>
          <EbaySync onProductsUpdated={handleProductsUpdated} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Placeholder for future sync components */}
        <div className="lg:col-span-2"></div>

        {/* Connection Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                Your marketplace connection details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Store Status</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">API Access</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Last Sync</span>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common marketplace integration tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Store className="h-4 w-4 mr-2" />
                Sync Products
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Webhooks
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Sync Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Stores</CardTitle>
          <CardDescription>
            Details about your connected marketplace stores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Store Name</h4>
              <p className="font-medium">{store?.store_name || '—'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Domain</h4>
              <p className="font-medium">{store?.domain || '—'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Plan</h4>
              <p className="font-medium">{store?.platform === 'shopify' ? 'Shopify' : (store?.platform || '—')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}