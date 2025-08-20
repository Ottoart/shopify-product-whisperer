import { useModuleOverview } from '@/hooks/useModuleOverview';
import { ModuleOverviewCard } from '@/components/ModuleOverviewCard';
import { Package, TrendingUp, Warehouse, ShoppingCart, Users, Loader2, Zap } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionData } from '@/hooks/useSubscription';

interface ModuleOverviewGridProps {
  targetUserId?: string;
  subscription?: SubscriptionData;
}

export function ModuleOverviewGrid({ targetUserId, subscription }: ModuleOverviewGridProps) {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: overview, isLoading, error } = useModuleOverview(targetUserId);

  // Handle billing portal for upgrades
  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-create-portal', {
        body: targetUserId && isAdmin ? { userId: targetUserId } : {}
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-center h-64 bg-muted/10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load module overview</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Create module configurations with subscription awareness
  const createModuleConfig = (
    moduleKey: keyof typeof subscription.entitlements,
    title: string,
    description: string,
    icon: React.ReactNode,
    primaryPath: string
  ) => {
    const enabled = subscription?.entitlements?.[moduleKey] ?? false;
    const upgradeRequired = !enabled;

    return {
      enabled,
      upgradeRequired,
      title,
      description,
      icon,
      primaryCTA: enabled ? {
        label: `Go to ${title}`,
        onClick: () => navigate(primaryPath),
        variant: 'default' as const
      } : {
        label: 'Upgrade to Use',
        onClick: handleUpgrade,
        variant: 'outline' as const
      }
    };
  };

  // Create module cards with subscription integration - but provide defaults if subscription is not available
  const moduleConfigs = [
    createModuleConfig(
      'shipping',
      'Shipping',
      'Manage your shipments and track deliveries',
      <Package className="h-6 w-6" />,
      '/shipping'
    ),
    createModuleConfig(
      'repricing',
      'Repricing',
      'AI-powered pricing optimization',
      <TrendingUp className="h-6 w-6" />,
      '/repricing'
    ),
    createModuleConfig(
      'fulfillment',
      'Fulfillment',
      'Inventory and order fulfillment',
      <Warehouse className="h-6 w-6" />,
      '/send-inventory'
    ),
    createModuleConfig(
      'productManagement',
      'Product Management',
      'Optimize and manage your product catalog',
      <ShoppingCart className="h-6 w-6" />,
      '/products'
    )
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Shipping Module */}
      <ModuleOverviewCard
        {...moduleConfigs[0]}
        metrics={{
          primary: {
            label: "Pending Orders",
            value: overview.shipping.pendingOrdersCount,
            trend: 'neutral' as const
          },
          secondary: [
            { label: "Labels (7d)", value: overview.shipping.labelsLast7Days },
            { label: "Labels (30d)", value: overview.shipping.labelsLast30Days },
            { label: "Avg Pack Time", value: `${Math.round(overview.shipping.avgPackTimeMinutes)}m` },
            { label: "Shipping Spend", value: `$${overview.shipping.totalShippingSpend.toFixed(2)}` }
          ]
        }}
        quickActions={moduleConfigs[0].enabled ? [
          { label: "Create Shipment", path: "/shipping" },
          { label: "Manage Returns", path: "/shipping/returns" },
          { label: "Carrier Settings", path: "/carriers" }
        ] : []}
        recentActivity={overview.shipping.recentActivity}
        healthScore={85}
        usagePercent={50}
      />

      {/* Repricing Module */}
      <ModuleOverviewCard
        {...moduleConfigs[1]}
        metrics={{
          primary: {
            label: "Active Listings",
            value: overview.repricing.activeListingsCount,
            trend: 'up' as const
          },
          secondary: [
            { label: "Price Changes (7d)", value: overview.repricing.priceChangesLast7Days },
            { label: "Price Changes (30d)", value: overview.repricing.priceChangesLast30Days },
            { label: "Avg Confidence", value: `${Math.round(overview.repricing.avgConfidenceScore * 100)}%` },
            { label: "Revenue Impact", value: `$${overview.repricing.totalRevenueImpact.toFixed(2)}` }
          ]
        }}
        quickActions={moduleConfigs[1].enabled ? [
          { label: "View Recommendations", path: "/repricing" },
          { label: "Manage Strategies", path: "/strategies" },
          { label: "Analytics", path: "/analytics" }
        ] : []}
        recentActivity={overview.repricing.recentActivity}
        healthScore={Math.round(overview.repricing.avgConfidenceScore * 100)}
        usagePercent={75}
      />

      {/* Fulfillment Module */}
      <ModuleOverviewCard
        {...moduleConfigs[2]}
        metrics={{
          primary: {
            label: "Items in Stock",
            value: overview.fulfillment.totalItemsInStock,
            trend: 'neutral' as const
          },
          secondary: [
            { label: "Active Submissions", value: overview.fulfillment.activeSubmissionsCount },
            { label: "Orders Fulfilled", value: overview.fulfillment.recentOrdersFulfilled },
            { label: "Open Tasks", value: overview.fulfillment.openReceivingTasks },
            { label: "Avg Fulfillment", value: `${Math.round(overview.fulfillment.avgFulfillmentTimeMinutes)}m` }
          ]
        }}
        quickActions={moduleConfigs[2].enabled ? [
          { label: "Send Inventory", path: "/send-inventory" },
          { label: "Receiving Tasks", path: "/receiving" },
          { label: "Inventory Dashboard", path: "/inventory-dashboard" }
        ] : []}
        recentActivity={overview.fulfillment.recentActivity}
        healthScore={overview.fulfillment.lowStockAlertsCount > 0 ? 60 : 90}
        alertsCount={overview.fulfillment.lowStockAlertsCount}
        usagePercent={30}
      />

      {/* Product Management Module */}
      <ModuleOverviewCard
        {...moduleConfigs[3]}
        metrics={{
          primary: {
            label: "Products Managed",
            value: overview.productManagement.totalProductsManaged,
            trend: 'up' as const
          },
          secondary: [
            { label: "Optimized (30d)", value: overview.productManagement.productsOptimizedCount },
            { label: "Pending Drafts", value: overview.productManagement.pendingDraftsCount },
            { label: "Marketplaces", value: overview.productManagement.marketplacesConnected },
            { label: "Sync Health", value: `${overview.productManagement.syncHealthScore}%` }
          ]
        }}
        quickActions={moduleConfigs[3].enabled ? [
          { label: "Manage Products", path: "/products" },
          { label: "Bulk Editor", path: "/bulk-editor" },
          { label: "Marketplace Sync", path: "/settings" }
        ] : []}
        recentActivity={overview.productManagement.recentActivity}
        healthScore={overview.productManagement.syncHealthScore}
        usagePercent={60}
      />
    </div>
  );
}