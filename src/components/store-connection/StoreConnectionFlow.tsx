import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoreSelector } from "./StoreSelector";
import { StoreCredentialsForm } from "./StoreCredentialsForm";
import { ConnectionSuccess } from "./ConnectionSuccess";
import { Marketplace } from "./types";

interface StoreConnectionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "select" | "credentials" | "success";

export function StoreConnectionFlow({ open, onOpenChange, onSuccess }: StoreConnectionFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null);
  const [connectionData, setConnectionData] = useState<any>(null);

  const handleMarketplaceSelect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
    setCurrentStep("credentials");
  };

  const handleConnectionSuccess = (data: any) => {
    setConnectionData(data);
    setCurrentStep("success");
  };

  const handleBack = () => {
    if (currentStep === "credentials") {
      setCurrentStep("select");
      setSelectedMarketplace(null);
    }
  };

  const handleClose = () => {
    setCurrentStep("select");
    setSelectedMarketplace(null);
    setConnectionData(null);
    onOpenChange(false);
    if (currentStep === "success") {
      onSuccess();
    }
  };

  const handleFinish = () => {
    handleClose();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Progress indicator */}
        <div className="flex items-center justify-center p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "select" ? "bg-primary text-primary-foreground" : 
              currentStep === "credentials" || currentStep === "success" ? "bg-primary text-primary-foreground" : 
              "bg-muted text-muted-foreground"
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${
              currentStep === "credentials" || currentStep === "success" ? "bg-primary" : "bg-muted"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "credentials" ? "bg-primary text-primary-foreground" : 
              currentStep === "success" ? "bg-primary text-primary-foreground" : 
              "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <div className={`w-12 h-0.5 ${
              currentStep === "success" ? "bg-primary" : "bg-muted"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "success" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {currentStep === "select" && (
            <StoreSelector onSelect={handleMarketplaceSelect} />
          )}
          
          {currentStep === "credentials" && selectedMarketplace && (
            <StoreCredentialsForm
              marketplace={selectedMarketplace}
              onBack={handleBack}
              onSuccess={handleConnectionSuccess}
            />
          )}
          
          {currentStep === "success" && selectedMarketplace && connectionData && (
            <ConnectionSuccess
              marketplace={selectedMarketplace}
              connectionData={connectionData}
              onFinish={handleFinish}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}