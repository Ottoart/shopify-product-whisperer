import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Store, 
  ShoppingCart, 
  CheckCircle, 
  ExternalLink, 
  AlertCircle, 
  Plus,
  ArrowRight
} from "lucide-react";
import { StoreConnectionFlow } from "./store-connection/StoreConnectionFlow";

interface ConnectStoreButtonProps {
  onStoreConnected?: () => void;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  showInstructions?: boolean;
  className?: string;
  showIcon?: boolean;
  redirectToSettings?: boolean;
}

const SUPPORTED_PLATFORMS = [
  {
    id: "shopify",
    name: "Shopify",
    icon: ShoppingCart,
    description: "Connect your Shopify store to sync products, orders, and inventory",
    features: ["Product sync", "Order management", "Inventory tracking", "Analytics"],
    difficulty: "Easy",
    setupTime: "5 minutes",
    isPopular: true
  },
  {
    id: "ebay",
    name: "eBay", 
    icon: Store,
    description: "Connect to eBay for marketplace selling and listing management",
    features: ["Listing sync", "Order processing", "Inventory management", "Repricing"],
    difficulty: "Medium",
    setupTime: "10 minutes", 
    isPopular: false
  }
];

export function ConnectStoreButton({ 
  onStoreConnected, 
  variant = "default", 
  size = "default",
  showInstructions = true,
  className = "",
  showIcon = true,
  redirectToSettings = false
}: ConnectStoreButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStoreConnected = () => {
    setIsDialogOpen(false);
    onStoreConnected?.();
  };

  const handleClick = () => {
    if (redirectToSettings) {
      window.location.href = '/settings?tab=store';
    } else {
      setIsDialogOpen(true);
    }
  };

  if (redirectToSettings) {
    return (
      <Button variant={variant} size={size} className={`gap-2 ${className}`} onClick={handleClick}>
        {showIcon && <Plus className="h-4 w-4" />}
        Manage Stores
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          {showIcon && <Plus className="h-4 w-4" />}
          Connect Store
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Connect Your Store
          </DialogTitle>
          <DialogDescription>
            Choose a platform to connect and start managing your products with PrepFox
          </DialogDescription>
        </DialogHeader>

        {showInstructions && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Before you start:</strong> Make sure you have admin access to your store and 
              any necessary API credentials or app installation permissions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {SUPPORTED_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <Card 
                key={platform.id} 
                className="relative hover:shadow-md transition-shadow cursor-pointer group"
              >
                {platform.isPopular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {platform.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {platform.setupTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {platform.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {platform.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <StoreConnectionFlow 
                      open={false}
                      onOpenChange={() => {}}
                      onSuccess={handleStoreConnected}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Check out our setup guides and troubleshooting resources:
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.prepfox.com/setup" target="_blank" rel="noopener noreferrer">
                Setup Guide
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.prepfox.com/troubleshooting" target="_blank" rel="noopener noreferrer">
                Troubleshooting
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}