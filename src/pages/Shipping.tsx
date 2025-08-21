import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, RotateCcw, Settings, Zap, Webhook } from "lucide-react";
import { OrderManagement } from "@/components/shipping/OrderManagement";
import { ShippingRules } from "@/components/shipping/ShippingRules";
import { BatchActionQueue } from "@/components/shipping/BatchActionQueue";

import { ShopifyConnectionTest } from "@/components/shipping/ShopifyConnectionTest";
import { WebhookTester } from "@/components/shipping/WebhookTester";
import { CarrierCredentialValidator } from "@/components/shipping/CarrierCredentialValidator";
import { AIShippingRecommendations } from "@/components/shipping/AIShippingRecommendations";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";

export default function Shipping() {
  const [activeTab, setActiveTab] = useState("orders");
  const { store } = useShopifyCredentials();

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
        <TabsList className="flex w-full overflow-x-auto gap-1 p-1 md:grid md:grid-cols-4 lg:grid-cols-4 h-auto">
          <TabsTrigger value="orders" className="flex items-center gap-2 flex-shrink-0">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2 flex-shrink-0">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2 flex-shrink-0">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Batch</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2 flex-shrink-0">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="rules">
          <ShippingRules />
        </TabsContent>

        <TabsContent value="batch">
          <BatchActionQueue />
        </TabsContent>


        <TabsContent value="webhooks">
          <WebhookTester />
        </TabsContent>

      </Tabs>
    </div>
  );
}