import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Store, 
  Package, 
  Truck, 
  TrendingUp, 
  BarChart3,
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Zap,
  ShoppingCart,
  Globe
} from "lucide-react";

interface MarketplaceConnection {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  lastSync?: string;
  accountName?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'paused';
}

interface Module {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  icon: any;
  route: string;
  status: 'available' | 'beta' | 'coming-soon';
}

export default function MarketplaceGateway() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [marketplaces, setMarketplaces] = useState<MarketplaceConnection[]>([
    {
      id: 'shopify',
      name: 'Shopify',
      logo: '🛍️',
      connected: true,
      lastSync: '5 min ago',
      accountName: 'my-store.myshopify.com',
      status: 'connected'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      logo: '📦',
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'ebay',
      name: 'eBay',
      logo: '🏪',
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'walmart',
      name: 'Walmart',
      logo: '🏬',
      connected: false,
      status: 'disconnected'
    }
  ]);

  const modules: Module[] = [
    {
      id: 'product-management',
      title: 'Product Management',
      description: 'View, edit, and organize products across stores',
      bullets: ['Bulk actions', 'Category mapping', 'Image manager'],
      icon: Package,
      route: '/bulk-editor',
      status: 'available'
    },
    {
      id: 'shipping-fulfillment',
      title: 'Shipping & Fulfillment',
      description: 'Multi-channel order management',
      bullets: ['Print labels', 'Automate rules', 'Track returns'],
      icon: Truck,
      route: '/shipping',
      status: 'available'
    },
    {
      id: 'repricing-engine',
      title: 'Repricing Engine',
      description: 'Auto-adjust prices based on competitor data',
      bullets: ['Rules for margins', 'Market analysis', 'Multi-channel sync'],
      icon: TrendingUp,
      route: '/repricing',
      status: 'beta'
    },
    {
      id: 'inventory-sync',
      title: 'Inventory Sync',
      description: 'Sync stock across channels',
      bullets: ['Safety stock buffers', 'Low-stock alerts', 'Reorder reports'],
      icon: BarChart3,
      route: '/inventory',
      status: 'coming-soon'
    }
  ];

  const handleConnect = async (marketplaceId: string) => {
    if (marketplaceId === 'shopify') {
      navigate('/shopify-integration');
      return;
    }

    // Update marketplace status to syncing
    setMarketplaces(prev => prev.map(m => 
      m.id === marketplaceId 
        ? { ...m, status: 'syncing' as const }
        : m
    ));

    toast({
      title: `🔄 Connecting to ${marketplaces.find(m => m.id === marketplaceId)?.name}...`,
      description: "This could take a few seconds ☕",
    });

    // Simulate connection process
    setTimeout(() => {
      setMarketplaces(prev => prev.map(m => 
        m.id === marketplaceId 
          ? { 
              ...m, 
              connected: true, 
              status: 'connected' as const,
              lastSync: 'just now',
              accountName: `your-${marketplaceId}-account`
            }
          : m
      ));

      toast({
        title: "🎉 Connection successful!",
        description: `${marketplaces.find(m => m.id === marketplaceId)?.name} store connected. Orders are syncing...`,
      });
    }, 2000);
  };

  const handleModuleAccess = (module: Module) => {
    const hasConnectedMarketplace = marketplaces.some(m => m.connected);

    if (!hasConnectedMarketplace) {
      toast({
        title: "Connection Required",
        description: "You'll need to connect a store before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (module.status === 'coming-soon') {
      toast({
        title: "Coming Soon",
        description: `${module.title} will be available soon!`,
      });
      return;
    }

    navigate(module.route);
  };

  const getStatusBadge = (status: MarketplaceConnection['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'syncing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Syncing...</Badge>;
      case 'paused':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Not Connected</Badge>;
    }
  };

  const getModuleStatusBadge = (status: Module['status']) => {
    switch (status) {
      case 'beta':
        return <Badge variant="secondary">Beta</Badge>;
      case 'coming-soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  const hasConnectedMarketplace = marketplaces.some(m => m.connected);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace Gateway</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your marketplaces and access powerful tools to manage your business across all channels
        </p>
      </div>

      {/* Setup Prompt */}
      {!hasConnectedMarketplace && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-center">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Let's start by connecting a store 👇</h3>
            <p className="text-muted-foreground">Choose a marketplace below to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Marketplace Connectors */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Store className="h-6 w-6" />
          Connected Marketplaces
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketplaces.map((marketplace) => (
            <Card key={marketplace.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{marketplace.logo}</span>
                    <CardTitle className="text-lg">{marketplace.name}</CardTitle>
                  </div>
                  {getStatusBadge(marketplace.status)}
                </div>
                {marketplace.connected && marketplace.accountName && (
                  <CardDescription className="text-xs">
                    {marketplace.accountName}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {marketplace.connected && marketplace.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {marketplace.lastSync}
                  </p>
                )}
                
                <Button 
                  onClick={() => handleConnect(marketplace.id)}
                  disabled={marketplace.status === 'syncing'}
                  size="sm"
                  variant={marketplace.connected ? "outline" : "default"}
                  className="w-full"
                >
                  {marketplace.status === 'syncing' ? (
                    "Connecting..."
                  ) : marketplace.connected ? (
                    "Manage"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Modules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Available Modules
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    {getModuleStatusBadge(module.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-1">
                    {module.bullets.map((bullet, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleModuleAccess(module)}
                    className="w-full"
                    variant={module.status === 'available' ? "default" : "outline"}
                  >
                    {module.status === 'coming-soon' ? (
                      "Coming Soon"
                    ) : module.status === 'beta' ? (
                      "Enter Module (Beta)"
                    ) : (
                      "Enter Module"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}