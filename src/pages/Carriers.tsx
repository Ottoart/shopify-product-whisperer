import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { UserCarrierManagement } from "@/components/shipping/UserCarrierManagement";
import { UserCarrierAccountsDialog } from "@/components/shipping/UserCarrierAccountsDialog";
import { MockDataBadge, LiveDataBadge } from "@/components/ui/mock-data-badge";

export default function Carriers() {
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);

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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium">Personal Carrier Integrations</h3>
                  <p className="text-sm text-muted-foreground">Configure your own carrier API credentials</p>
                </div>
                <Button onClick={() => setIsAddAccountDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Carrier Account
                </Button>
              </div>
              
              <MockDataBadge>
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Personal Accounts Connected</h3>
                  <p className="text-sm">Connect your own carrier API accounts to get direct rates and billing.</p>
                </div>
              </MockDataBadge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Carrier Accounts Dialog */}
      <UserCarrierAccountsDialog 
        isOpen={isAddAccountDialogOpen} 
        onClose={() => setIsAddAccountDialogOpen(false)} 
      />
    </div>
  );
}