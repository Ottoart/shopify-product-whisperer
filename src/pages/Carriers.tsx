import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { CarrierManagement } from "@/components/shipping/CarrierManagement";
import { CarrierConfigurationDialog } from "@/components/shipping/CarrierConfigurationDialog";
import { CarrierCredentialValidator } from "@/components/shipping/CarrierCredentialValidator";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Carriers() {
  const [isCarrierDialogOpen, setIsCarrierDialogOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Shipping Carriers</h1>
            <p className="text-muted-foreground">Configure and manage your shipping carrier integrations</p>
          </div>
        </div>

        {/* Quick Add Carrier Button */}
        <Card>
          <CardHeader>
            <CardTitle>Carrier Configuration</CardTitle>
            <CardDescription>
              Configure shipping carriers and manage their services. Connect with UPS, FedEx, USPS, Canada Post, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCarrierDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Configure New Carrier
            </Button>
          </CardContent>
        </Card>
        
        {/* Carrier Configuration Dialog */}
        <CarrierConfigurationDialog 
          isOpen={isCarrierDialogOpen} 
          onClose={() => setIsCarrierDialogOpen(false)} 
        />

        {/* Carrier Management */}
        <CarrierManagement />

        {/* Carrier Credential Validator */}
        <Card>
          <CardHeader>
            <CardTitle>Carrier Validation</CardTitle>
            <CardDescription>
              Test and validate your carrier API credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CarrierCredentialValidator />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}