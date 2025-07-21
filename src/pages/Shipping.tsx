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
import { ShopifyConnectionTest } from "@/components/shipping/ShopifyConnectionTest";
import { WebhookTester } from "@/components/shipping/WebhookTester";
import { CarrierCredentialValidator } from "@/components/shipping/CarrierCredentialValidator";
import { EnhancedTrackingDashboard } from "@/components/shipping/EnhancedTrackingDashboard";
import { ComprehensiveReturnsManagement } from "@/components/shipping/ComprehensiveReturnsManagement";
import { AIShippingRecommendations } from "@/components/shipping/AIShippingRecommendations";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Shipping() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Shipping & Fulfillment</h1>
            <p className="text-muted-foreground">Multi-channel order management, carrier rate comparison & label generation</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-10 h-auto gap-1 p-1">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Stores
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="carriers" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Carriers
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Intelligence
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
                <ShopifyConnectionTest 
                  storeId="04964ded-c61e-40db-bf5c-fea9ff794681" 
                  storeName="Prohair" 
                />
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
            <EnhancedTrackingDashboard />
          </TabsContent>

          <TabsContent value="returns">
            <ComprehensiveReturnsManagement />
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
            <WebhookTester />
          </TabsContent>

          <TabsContent value="validation">
            <CarrierCredentialValidator />
          </TabsContent>

          <TabsContent value="ai">
            <AIShippingRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}