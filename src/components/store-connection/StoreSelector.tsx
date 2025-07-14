import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Marketplace } from "./types";

interface StoreSelectorProps {
  onSelect: (marketplace: Marketplace) => void;
}

// High-quality marketplace data with official logos
const marketplaces: Marketplace[] = [
  {
    id: "shopify",
    name: "Shopify",
    platform: "shopify",
    logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    description: "Connect your Shopify store to sync products and orders",
    isPopular: true,
    benefits: ["Real-time sync", "Inventory management", "Order fulfillment"]
  },
  {
    id: "amazon-us",
    name: "Amazon US",
    platform: "amazon",
    logo: "https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg",
    description: "Sell on the world's largest marketplace",
    isPopular: true,
    benefits: ["Massive customer base", "FBA integration", "Prime eligibility"]
  },
  {
    id: "amazon-ca",
    name: "Amazon Canada",
    platform: "amazon",
    logo: "https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg",
    description: "Reach Canadian customers through Amazon",
    benefits: ["Canadian market", "FBA integration", "Prime eligibility"]
  },
  {
    id: "ebay",
    name: "eBay",
    platform: "ebay",
    logo: "https://cdn.worldvectorlogo.com/logos/ebay-2.svg",
    description: "List products on the global auction and shopping platform",
    benefits: ["Auction format", "Global reach", "Best Match algorithm"]
  },
  {
    id: "walmart-us",
    name: "Walmart US",
    platform: "walmart",
    logo: "https://cdn.worldvectorlogo.com/logos/walmart-logo-2.svg",
    description: "Sell on America's largest retailer",
    isPopular: true,
    benefits: ["Trusted brand", "Low fees", "Growing marketplace"]
  },
  {
    id: "walmart-ca",
    name: "Walmart Canada",
    platform: "walmart",
    logo: "https://cdn.worldvectorlogo.com/logos/walmart-logo-2.svg",
    description: "Reach Canadian shoppers through Walmart",
    benefits: ["Canadian market", "Competitive fees", "Brand recognition"]
  },
  {
    id: "etsy",
    name: "Etsy",
    platform: "etsy",
    logo: "https://cdn.worldvectorlogo.com/logos/etsy-1.svg",
    description: "Perfect for handmade, vintage, and craft supplies",
    benefits: ["Creative marketplace", "Handmade focus", "Built-in audience"]
  },
  {
    id: "facebook",
    name: "Facebook Shop",
    platform: "facebook",
    logo: "https://cdn.worldvectorlogo.com/logos/facebook-2.svg",
    description: "Sell directly through Facebook and Instagram",
    benefits: ["Social commerce", "Instagram integration", "Targeted ads"]
  },
  {
    id: "google",
    name: "Google Shopping",
    platform: "google",
    logo: "https://cdn.worldvectorlogo.com/logos/google-icon.svg",
    description: "Showcase products in Google search results",
    benefits: ["Search visibility", "Free listings", "Performance tracking"]
  }
];

export function StoreSelector({ onSelect }: StoreSelectorProps) {
  const popularMarketplaces = marketplaces.filter(m => m.isPopular);
  const otherMarketplaces = marketplaces.filter(m => !m.isPopular);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Connect Your Store</h2>
        <p className="text-muted-foreground">
          Choose a marketplace or platform to connect and start selling
        </p>
      </div>

      <div className="space-y-6">
        {/* Popular Marketplaces */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Popular Marketplaces</h3>
            <Badge variant="secondary">Recommended</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularMarketplaces.map((marketplace) => (
              <MarketplaceCard
                key={marketplace.id}
                marketplace={marketplace}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        {/* Other Marketplaces */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Other Platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherMarketplaces.map((marketplace) => (
              <MarketplaceCard
                key={marketplace.id}
                marketplace={marketplace}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MarketplaceCardProps {
  marketplace: Marketplace;
  onSelect: (marketplace: Marketplace) => void;
}

function MarketplaceCard({ marketplace, onSelect }: MarketplaceCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border-2 hover:border-primary/50"
      onClick={() => onSelect(marketplace)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white p-2 shadow-sm border flex items-center justify-center flex-shrink-0">
            <img
              src={marketplace.logo}
              alt={`${marketplace.name} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                const img = e.currentTarget as HTMLImageElement;
                const fallback = img.nextElementSibling as HTMLElement;
                img.style.display = 'none';
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-sm" 
              style={{ display: 'none' }}
            >
              {marketplace.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{marketplace.name}</h4>
              {marketplace.isPopular && (
                <Badge variant="outline" className="text-xs">Popular</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {marketplace.description}
            </p>
            {marketplace.benefits && (
              <div className="flex flex-wrap gap-1 mt-2">
                {marketplace.benefits.slice(0, 2).map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
                {marketplace.benefits.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{marketplace.benefits.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
