import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { UserCarrierManagement } from "@/components/shipping/UserCarrierManagement";
import { MockDataBadge } from "@/components/ui/mock-data-badge";

export default function Carriers() {

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Shipping Carriers</h1>
          <p className="text-muted-foreground">Activate PrepFox carriers and manage your personal carrier accounts</p>
        </div>
      </div>

      <Tabs defaultValue="prepfox-carriers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prepfox-carriers">PrepFox Carriers</TabsTrigger>
          <TabsTrigger value="your-accounts">Your Carrier Accounts</TabsTrigger>
        </TabsList>

        {/* PrepFox Managed Carriers */}
        <TabsContent value="prepfox-carriers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                PrepFox Managed Carriers
              </CardTitle>
              <CardDescription>
                Activate shipping carriers managed by PrepFox. No API credentials required - just toggle on and select services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserCarrierManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* User's Own Carrier Accounts */}
        <TabsContent value="your-accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Your Carrier Accounts
              </CardTitle>
              <CardDescription>
                Connect and manage your own carrier API accounts for direct billing and custom rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MockDataBadge>
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Personal Carrier Accounts</h3>
                  <p className="text-sm">Personal carrier account functionality is currently unavailable. Use PrepFox managed carriers instead.</p>
                </div>
              </MockDataBadge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}