import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Store, Settings, Activity, CheckCircle, XCircle } from "lucide-react";

export default function ShopifyIntegration() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Shopify Integration</h1>
          <p className="text-muted-foreground">Connect and manage your Shopify store</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Your Shopify store connection details
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
              Common Shopify integration tasks
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

        {/* Store Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Details about your connected Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Store Name</h4>
                <p className="font-medium">Your Store Name</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Domain</h4>
                <p className="font-medium">your-store.myshopify.com</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Plan</h4>
                <p className="font-medium">Shopify Plus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}