import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package, RotateCcw, Settings, Zap, Building2, Store, Plus, Webhook, TestTube } from "lucide-react";
import { OrderManagement } from "@/components/shipping/OrderManagement";
import { CarrierRateComparison } from "@/components/shipping/CarrierRateComparison";
import { ShippingRules } from "@/components/shipping/ShippingRules";
import { TrackingPage } from "@/components/shipping/TrackingPage";
import { ReturnsManagement } from "@/components/shipping/ReturnsManagement";
import { BatchActionQueue } from "@/components/shipping/BatchActionQueue";
import { CarrierManagement } from "@/components/shipping/CarrierManagement";
import { CarrierConfigurationDialog } from "@/components/shipping/CarrierConfigurationDialog";
import { StoreConfig } from "@/components/StoreConfig";
import { ShopifyConnectionTest } from "@/components/shipping/ShopifyConnectionTest";
import { WebhookTester } from "@/components/shipping/WebhookTester";
import { CarrierCredentialValidator } from "@/components/shipping/CarrierCredentialValidator";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Shipping() {
  const [activeTab, setActiveTab] = useState("orders");
  const [isCarrierDialogOpen, setIsCarrierDialogOpen] = useState(false);

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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 h-auto gap-1 p-1">
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
            <CarrierRateComparison />
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
              {/* Quick Add Carrier Button */}
              <Card>
                <CardHeader>
                  <CardTitle>Carrier Configuration</CardTitle>
                  <CardDescription>
                    Configure shipping carriers and manage their services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsCarrierDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Configure Carriers
                  </Button>
                </CardContent>
              </Card>
              
              <CarrierConfigurationDialog 
                isOpen={isCarrierDialogOpen} 
                onClose={() => setIsCarrierDialogOpen(false)} 
              />
              <CarrierManagement />
            </div>
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookTester />
          </TabsContent>

          <TabsContent value="validation">
            <CarrierCredentialValidator />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}