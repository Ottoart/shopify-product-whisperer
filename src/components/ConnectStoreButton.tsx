import { Button } from "@/components/ui/button";
import { Store, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConnectStoreButtonProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  showIcon?: boolean;
}

export function ConnectStoreButton({ 
  size = "default", 
  variant = "outline", 
  className = "",
  showIcon = true 
}: ConnectStoreButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => navigate('/settings')}
      className={className}
    >
      {showIcon && <Store className="h-4 w-4 mr-2" />}
      Connect Store
    </Button>
  );
}