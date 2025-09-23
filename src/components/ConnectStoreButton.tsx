import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StoreConnectionFlow } from "./store-connection/StoreConnectionFlow";

interface ConnectStoreButtonProps {
  onStoreConnected?: () => void;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function ConnectStoreButton({ 
  onStoreConnected, 
  variant = "default", 
  size = "default",
  className = "",
  showIcon = true
}: ConnectStoreButtonProps) {
  const [isStoreFlowOpen, setIsStoreFlowOpen] = useState(false);

  const handleStoreConnected = () => {
    setIsStoreFlowOpen(false);
    onStoreConnected?.();
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={`gap-2 ${className}`}
        onClick={() => setIsStoreFlowOpen(true)}
      >
        {showIcon && <Plus className="h-4 w-4" />}
        Connect Store
      </Button>
      
      <StoreConnectionFlow 
        open={isStoreFlowOpen}
        onOpenChange={setIsStoreFlowOpen}
        onSuccess={handleStoreConnected}
      />
    </>
  );
}