import { Package, DollarSign, Warehouse, Settings, Loader2, RefreshCw } from 'lucide-react';
import { ModuleOverviewCard } from './ModuleOverviewCard';
import { useModuleOverview } from '@/hooks/useModuleOverview';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModuleOverviewGridProps {
  className?: string;
}

interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
}

export function ModuleOverviewGrid({ className = '' }: ModuleOverviewGridProps) {
  const { isAdmin } = useAdminAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const { data: moduleData, isLoading, error, refetch } = useModuleOverview(selectedUserId);

  // Fetch users for admin selection
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('admin-data', {
          body: { data_type: 'all_users' }
        });
        
        if (error) throw error;
        
        if (data?.users) {
          setAdminUsers(data.users);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-muted-foreground">Error loading module overview</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Admin User Selection */}
      {isAdmin && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">View metrics for:</span>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select user (leave empty for your data)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Your own data</SelectItem>
              {adminUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Module Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Shipping Module */}
        <ModuleOverviewCard
          title="Shipping"
          description="Order fulfillment and carrier management"
          icon={<Package className="h-5 w-5" />}
          metrics={{
            primary: {
              label: 'Pending Orders',
              value: moduleData.shipping.pendingOrdersCount,
              trend: moduleData.shipping.pendingOrdersCount > 10 ? 'up' : 'neutral'
            },
            secondary: [
              {
                label: 'Labels (7d)',
                value: moduleData.shipping.labelsLast7Days
              },
              {
                label: 'Total Spend',
                value: `$${moduleData.shipping.totalShippingSpend.toFixed(0)}`
              },
              {
                label: 'Avg Pack Time',
                value: `${Math.round(moduleData.shipping.avgPackTimeMinutes)}m`
              },
              {
                label: 'Carriers',
                value: moduleData.shipping.commonCarriers.length
              }
            ]
          }}
          quickActions={[
            { label: 'View Orders', path: '/shipping' },
            { label: 'Manage Carriers', path: '/carriers' },
            { label: 'Returns', path: '/shipping/returns' }
          ]}
          recentActivity={moduleData.shipping.recentActivity}
          healthScore={moduleData.shipping.pendingOrdersCount < 5 ? 90 : 70}
        />

        {/* Repricing Module */}
        <ModuleOverviewCard
          title="Repricing"
          description="AI-powered pricing optimization"
          icon={<DollarSign className="h-5 w-5" />}
          metrics={{
            primary: {
              label: 'Active Listings',
              value: moduleData.repricing.activeListingsCount,
              trend: moduleData.repricing.priceChangesLast7Days > 0 ? 'up' : 'neutral'
            },
            secondary: [
              {
                label: 'Changes (7d)',
                value: moduleData.repricing.priceChangesLast7Days
              },
              {
                label: 'Revenue Impact',
                value: `$${moduleData.repricing.totalRevenueImpact.toFixed(0)}`
              },
              {
                label: 'Confidence',
                value: `${Math.round(moduleData.repricing.avgConfidenceScore * 100)}%`
              },
              {
                label: 'Strategies',
                value: moduleData.repricing.strategiesCount
              }
            ]
          }}
          quickActions={[
            { label: 'View Listings', path: '/repricing?tab=listings' },
            { label: 'Strategies', path: '/strategies' },
            { label: 'Analytics', path: '/analytics' }
          ]}
          recentActivity={moduleData.repricing.recentActivity}
          healthScore={Math.round(moduleData.repricing.avgConfidenceScore * 100)}
        />

        {/* Fulfillment Module */}
        <ModuleOverviewCard
          title="Fulfillment"
          description="Inventory and warehouse management"
          icon={<Warehouse className="h-5 w-5" />}
          metrics={{
            primary: {
              label: 'Items in Stock',
              value: moduleData.fulfillment.totalItemsInStock.toLocaleString(),
              trend: moduleData.fulfillment.totalItemsInStock > 1000 ? 'up' : 'neutral'
            },
            secondary: [
              {
                label: 'Active Submissions',
                value: moduleData.fulfillment.activeSubmissionsCount
              },
              {
                label: 'Orders Fulfilled',
                value: moduleData.fulfillment.recentOrdersFulfilled
              },
              {
                label: 'Receiving Tasks',
                value: moduleData.fulfillment.openReceivingTasks
              },
              {
                label: 'Avg Time',
                value: `${Math.round(moduleData.fulfillment.avgFulfillmentTimeMinutes)}m`
              }
            ]
          }}
          quickActions={[
            { label: 'Send Inventory', path: '/send-inventory' },
            { label: 'Receiving', path: '/receiving' },
            { label: 'Dashboard', path: '/fulfillment' }
          ]}
          recentActivity={moduleData.fulfillment.recentActivity}
          alertsCount={moduleData.fulfillment.lowStockAlertsCount}
          healthScore={moduleData.fulfillment.lowStockAlertsCount === 0 ? 95 : 75}
        />

        {/* Product Management Module */}
        <ModuleOverviewCard
          title="Product Management"
          description="AI optimization and marketplace sync"
          icon={<Settings className="h-5 w-5" />}
          metrics={{
            primary: {
              label: 'Products Managed',
              value: moduleData.productManagement.totalProductsManaged.toLocaleString(),
              trend: moduleData.productManagement.productsOptimizedCount > 0 ? 'up' : 'neutral'
            },
            secondary: [
              {
                label: 'Optimized (30d)',
                value: moduleData.productManagement.productsOptimizedCount
              },
              {
                label: 'Sync Health',
                value: `${moduleData.productManagement.syncHealthScore}%`
              },
              {
                label: 'Marketplaces',
                value: moduleData.productManagement.marketplacesConnected
              },
              {
                label: 'Last Sync',
                value: moduleData.productManagement.lastSyncStatus === 'success' ? '✓' : '⚠'
              }
            ]
          }}
          quickActions={[
            { label: 'View Products', path: '/products' },
            { label: 'Bulk Editor', path: '/bulk-editor' },
            { label: 'Sync Status', path: '/marketplace-gateway' }
          ]}
          recentActivity={moduleData.productManagement.recentActivity}
          healthScore={moduleData.productManagement.syncHealthScore}
          alertsCount={moduleData.productManagement.lastSyncStatus === 'error' ? 1 : 0}
        />
      </div>
    </div>
  );
}