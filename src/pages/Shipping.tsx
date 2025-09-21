import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package, RotateCcw, Settings, Zap, Building2, Store, Webhook, TestTube, Brain } from "lucide-react";
import { OrderManagement } from "@/components/shipping/OrderManagement";
import { EnhancedShippingConfiguration } from "@/components/shipping/EnhancedShippingConfiguration";
import { ShippingRules } from "@/components/shipping/ShippingRules";
import { TrackingPage } from "@/components/shipping/TrackingPage";
import { ReturnsManagement } from "@/components/shipping/ReturnsManagement";
import { BatchActionQueue } from "@/components/shipping/BatchActionQueue";
import { StoreConfig } from "@/components/StoreConfig";
// Shopify integration removed

export default function Shipping() {
  const [activeTab, setActiveTab] = useState("orders");
  // Shopify credentials removed
  const store = null;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Shipping & Fulfillment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Multi-channel order management, carrier rate comparison & label generation</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto gap-1 p-1 md:grid md:grid-cols-4 lg:grid-cols-10 h-auto">
          <TabsTrigger value="orders" className="flex items-center gap-2 flex-shrink-0">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="stores" className="flex items-center gap-2 flex-shrink-0">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Stores</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2 flex-shrink-0">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Rates</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2 flex-shrink-0">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2 flex-shrink-0">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2 flex-shrink-0">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Returns</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2 flex-shrink-0">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Batch</span>
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex items-center gap-2 flex-shrink-0">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Carriers</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2 flex-shrink-0">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2 flex-shrink-0">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Validation</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 flex-shrink-0">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Intelligence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="stores">
          <div className="space-y-6">
            <StoreConfig />
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Connection Diagnostics</h3>
              <p className="text-sm text-muted-foreground">Shopify integration has been removed.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rates">
          <EnhancedShippingConfiguration />
        </TabsContent>

        <TabsContent value="rules">
          <ShippingRules />
        </TabsContent>

        <TabsContent value="tracking">
          <TrackingPage />
        </TabsContent>

        <TabsContent value="returns">
          <ReturnsManagement />
        </TabsContent>

        <TabsContent value="batch">
          <BatchActionQueue />
        </TabsContent>

        <TabsContent value="carriers">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Carrier Management Moved</h3>
                  <p className="text-muted-foreground mb-4">
                    Carrier configuration has been moved to Settings for better organization.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/settings'}
                    className="animate-fade-in"
                  >
                    Go to Settings → Carriers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Webhook testing has been removed.</p>
          </div>
        </TabsContent>

        <TabsContent value="validation">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carrier validation has been removed.</p>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="text-center py-8">
            <p className="text-muted-foreground">AI shipping recommendations have been removed.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}