import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ArrowRight } from "lucide-react";
import { MarketplaceConnectionDialog } from "./MarketplaceConnectionDialog";

interface Marketplace {
  id: string;
  name: string;
  platform: string;
  logo: string;
  description: string;
  isPopular?: boolean;
}

const marketplaces: Marketplace[] = [
  {
    id: "shopify",
    name: "Shopify",
    platform: "shopify",
    logo: "🛍️",
    description: "Complete ecommerce platform",
    isPopular: true
  },
  {
    id: "amazon-us",
    name: "Amazon US",
    platform: "amazon",
    logo: "📦",
    description: "Amazon United States marketplace",
    isPopular: true
  },
  {
    id: "amazon-ca",
    name: "Amazon Canada",
    platform: "amazon",
    logo: "📦",
    description: "Amazon Canada marketplace"
  },
  {
    id: "walmart-us",
    name: "Walmart US",
    platform: "walmart",
    logo: "🏪",
    description: "Walmart United States marketplace",
    isPopular: true
  },
  {
    id: "walmart-ca",
    name: "Walmart Canada",
    platform: "walmart",
    logo: "🏪",
    description: "Walmart Canada marketplace"
  },
  {
    id: "ebay",
    name: "eBay",
    platform: "ebay",
    logo: "🎯",
    description: "Global online marketplace"
  },
  {
    id: "etsy",
    name: "Etsy",
    platform: "etsy",
    logo: "🎨",
    description: "Marketplace for unique & creative goods"
  },
  {
    id: "facebook",
    name: "Facebook Marketplace",
    platform: "facebook",
    logo: "📘",
    description: "Social commerce platform"
  },
  {
    id: "google",
    name: "Google Shopping",
    platform: "google",
    logo: "🔍",
    description: "Google's shopping platform"
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    platform: "tiktok",
    logo: "🎵",
    description: "Social commerce on TikTok"
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    platform: "bigcommerce",
    logo: "🏢",
    description: "Enterprise ecommerce platform"
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    platform: "woocommerce",
    logo: "🔧",
    description: "WordPress ecommerce plugin"
  }
];

interface MarketplaceSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (marketplace: Marketplace) => void;
}

export function MarketplaceSelector({ open, onOpenChange, onSelect }: MarketplaceSelectorProps) {
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  const handleSelect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
  };

  const handleConfirm = () => {
    if (selectedMarketplace) {
      setShowConnectionDialog(true);
    }
  };

  const handleConnectionSuccess = () => {
    onSelect(selectedMarketplace!);
    setShowConnectionDialog(false);
    onOpenChange(false);
    setSelectedMarketplace(null);
  };

  const handleBackToSelection = () => {
    setShowConnectionDialog(false);
  };

  return (
    <>
      <Dialog open={open && !showConnectionDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Select Marketplace
            </DialogTitle>
            <DialogDescription>
              Choose a marketplace to connect your store
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {marketplaces.map((marketplace) => (
              <Card 
                key={marketplace.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMarketplace?.id === marketplace.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelect(marketplace)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{marketplace.logo}</div>
                    {marketplace.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{marketplace.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {marketplace.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {selectedMarketplace && (
              <Button onClick={handleConfirm} className="gap-2">
                Continue with {selectedMarketplace.name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MarketplaceConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        marketplace={selectedMarketplace}
        onBack={handleBackToSelection}
        onSuccess={handleConnectionSuccess}
      />
    </>
  );
}