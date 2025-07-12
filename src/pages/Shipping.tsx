import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, BarChart3, RotateCcw, Settings, Zap, Building2, Store, Home } from "lucide-react";
import { OrderManagement } from "@/components/shipping/OrderManagement";
import { ShippingOverview } from "@/components/shipping/ShippingOverview";
import { CarrierRateComparison } from "@/components/shipping/CarrierRateComparison";
import { ShippingRules } from "@/components/shipping/ShippingRules";
import { TrackingPage } from "@/components/shipping/TrackingPage";
import { ShippingAnalytics } from "@/components/shipping/ShippingAnalytics";
import { ReturnsManagement } from "@/components/shipping/ReturnsManagement";
import { BatchActionQueue } from "@/components/shipping/BatchActionQueue";
import { CarrierManagement } from "@/components/shipping/CarrierManagement";
import { StoreConfig } from "@/components/StoreConfig";

export default function Shipping() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
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
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
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
        </TabsList>

        
        <TabsContent value="overview">
          <ShippingOverview />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="stores">
          <StoreConfig />
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

        <TabsContent value="analytics">
          <ShippingAnalytics />
        </TabsContent>

        <TabsContent value="returns">
          <ReturnsManagement />
        </TabsContent>

        <TabsContent value="batch">
          <BatchActionQueue />
        </TabsContent>

        <TabsContent value="carriers">
          <CarrierManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}