import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  PlusCircle,
  Settings,
  BarChart3,
  Zap
} from "lucide-react";
import RepricingDashboard from "@/components/repricing/RepricingDashboard";
import RuleBuilder from "@/components/repricing/RuleBuilder";
import MarketplaceIntegrations from "@/components/repricing/MarketplaceIntegrations";
import SKUManagement from "@/components/repricing/SKUManagement";
import RepricingAnalytics from "@/components/repricing/RepricingAnalytics";
import AlertsManagement from "@/components/repricing/AlertsManagement";
import RepricingSettings from "@/components/repricing/RepricingSettings";

export default function Repricing() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dynamic Repricing</h1>
          <p className="text-muted-foreground">
            Manage pricing strategies across all your marketplaces
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab("rules")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="marketplaces" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Marketplaces
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            Products
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RepricingDashboard />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <RuleBuilder />
        </TabsContent>

        <TabsContent value="marketplaces" className="space-y-6">
          <MarketplaceIntegrations />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <SKUManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RepricingAnalytics />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <RepricingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}