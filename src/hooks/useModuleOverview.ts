import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';

export interface ShippingOverview {
  pendingOrdersCount: number;
  labelsLast7Days: number;
  labelsLast30Days: number;
  totalShippingSpend: number;
  totalShippingSavings: number;
  avgPackTimeMinutes: number;
  commonCarriers: string[];
  recentActivity: {
    type: 'label_created' | 'order_shipped' | 'carrier_added';
    description: string;
    timestamp: string;
  }[];
}

export interface RepricingOverview {
  activeListingsCount: number;
  priceChangesLast7Days: number;
  priceChangesLast30Days: number;
  totalRevenueImpact: number;
  avgConfidenceScore: number;
  strategiesCount: number;
  recentActivity: {
    type: 'price_updated' | 'strategy_created' | 'recommendation_applied';
    description: string;
    timestamp: string;
  }[];
}

export interface FulfillmentOverview {
  activeSubmissionsCount: number;
  totalItemsInStock: number;
  recentOrdersFulfilled: number;
  openReceivingTasks: number;
  lowStockAlertsCount: number;
  avgFulfillmentTimeMinutes: number;
  recentActivity: {
    type: 'submission_created' | 'items_received' | 'order_fulfilled' | 'stock_alert';
    description: string;
    timestamp: string;
  }[];
}

export interface ProductManagementOverview {
  productsOptimizedCount: number;
  pendingDraftsCount: number;
  syncHealthScore: number;
  marketplacesConnected: number;
  lastSyncStatus: 'success' | 'error' | 'pending';
  totalProductsManaged: number;
  recentActivity: {
    type: 'product_optimized' | 'sync_completed' | 'marketplace_connected' | 'bulk_edit';
    description: string;
    timestamp: string;
  }[];
}

export interface ModuleOverview {
  shipping: ShippingOverview;
  repricing: RepricingOverview;
  fulfillment: FulfillmentOverview;
  productManagement: ProductManagementOverview;
}

export const useModuleOverview = (targetUserId?: string) => {
  const { isAdmin } = useAdminAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Determine which user ID to use for queries
  const effectiveUserId = targetUserId && isAdmin ? targetUserId : user?.id;

  const fetchModuleOverview = async (): Promise<ModuleOverview> => {
    if (!effectiveUserId) {
      throw new Error('No user available for fetching data');
    }

    console.log('🔍 Fetching module overview for user:', effectiveUserId);

    // Fetch all data in parallel
    const [
      shippingData,
      repricingData,
      fulfillmentData,
      productData
    ] = await Promise.all([
      fetchShippingOverview(effectiveUserId),
      fetchRepricingOverview(effectiveUserId),
      fetchFulfillmentOverview(effectiveUserId),
      fetchProductManagementOverview(effectiveUserId)
    ]);

    return {
      shipping: shippingData,
      repricing: repricingData,
      fulfillment: fulfillmentData,
      productManagement: productData
    };
  };

  const fetchShippingOverview = async (userId: string): Promise<ShippingOverview> => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch orders and shipping labels
    const [ordersResult, labelsResult, packSessionsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('status, created_at')
        .eq('user_id', userId),
      supabase
        .from('shipping_labels')
        .select('carrier, shipping_cost, created_at')
        .eq('user_id', userId),
      supabase
        .from('pack_sessions')
        .select('actual_time_minutes, completed_at')
        .eq('user_id', userId)
        .not('actual_time_minutes', 'is', null)
    ]);

    const orders = ordersResult.data || [];
    const labels = labelsResult.data || [];
    const packSessions = packSessionsResult.data || [];

    // Calculate metrics
    const pendingOrdersCount = orders.filter(o => 
      o.status === 'pending' || o.status === 'awaiting' || o.status === 'processing'
    ).length;

    const labelsLast7Days = labels.filter(l => 
      new Date(l.created_at) >= sevenDaysAgo
    ).length;

    const labelsLast30Days = labels.filter(l => 
      new Date(l.created_at) >= thirtyDaysAgo
    ).length;

    const totalShippingSpend = labels.reduce((sum, l) => sum + (l.shipping_cost || 0), 0);
    
    const avgPackTimeMinutes = packSessions.length > 0 
      ? packSessions.reduce((sum, p) => sum + p.actual_time_minutes, 0) / packSessions.length
      : 0;

    const carrierCounts = labels.reduce((acc, l) => {
      if (l.carrier) {
        acc[l.carrier] = (acc[l.carrier] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const commonCarriers = Object.entries(carrierCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([carrier]) => carrier);

    // Recent activity from shipping labels
    const recentActivity = labels
      .slice(0, 5)
      .map(label => ({
        type: 'label_created' as const,
        description: `Label created for ${label.carrier} shipping`,
        timestamp: label.created_at
      }));

    return {
      pendingOrdersCount,
      labelsLast7Days,
      labelsLast30Days,
      totalShippingSpend,
      totalShippingSavings: totalShippingSpend * 0.15, // Estimated 15% savings
      avgPackTimeMinutes,
      commonCarriers,
      recentActivity
    };
  };

  const fetchRepricingOverview = async (userId: string): Promise<RepricingOverview> => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: recommendations } = await (supabase as any)
      .from('ai_pricing_recommendations')
      .select('status, confidence_score, created_at, applied_at, recommendation_data')
      .eq('user_id', userId);

    const recos = (recommendations as any) || [];

    const activeListingsCount = recos.filter(r => r.status === 'active').length;
    
    const priceChangesLast7Days = recos.filter(r => 
      r.applied_at && new Date(r.applied_at) >= sevenDaysAgo
    ).length;

    const priceChangesLast30Days = recos.filter(r => 
      r.applied_at && new Date(r.applied_at) >= thirtyDaysAgo
    ).length;

    const avgConfidenceScore = recos.length > 0 
      ? recos.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / recos.length
      : 0;

    // Calculate estimated revenue impact from recommendation data
    const totalRevenueImpact = recos
      .filter(r => {
        const data = r.recommendation_data as any;
        return data && typeof data === 'object' && data.estimated_revenue_impact;
      })
      .reduce((sum, r) => {
        const data = r.recommendation_data as any;
        return sum + (data.estimated_revenue_impact || 0);
      }, 0);

    const recentActivity = recos
      .filter(r => r.applied_at)
      .slice(0, 5)
      .map(reco => ({
        type: 'recommendation_applied' as const,
        description: `Pricing recommendation applied (${Math.round(reco.confidence_score * 100)}% confidence)`,
        timestamp: reco.applied_at!
      }));

    return {
      activeListingsCount,
      priceChangesLast7Days,
      priceChangesLast30Days,
      totalRevenueImpact,
      avgConfidenceScore,
      strategiesCount: 3, // Mock data - would come from strategies table
      recentActivity
    };
  };

  const fetchFulfillmentOverview = async (userId: string): Promise<FulfillmentOverview> => {
    const [submissionsResult, itemsResult, packSessionsResult, alertsResult] = await Promise.all([
      supabase
        .from('inventory_submissions')
        .select('status, created_at')
        .eq('user_id', userId),
      supabase
        .from('bin_inventory')
        .select('quantity, submission_items!inner(submission_id)')
        .eq('submission_items.inventory_submissions.user_id', userId),
      supabase
        .from('pack_sessions')
        .select('status, created_at, actual_time_minutes')
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase
        .from('low_stock_alerts')
        .select('is_acknowledged, created_at')
        .eq('is_acknowledged', false)
    ]);

    const submissions = submissionsResult.data || [];
    const binItems = itemsResult.data || [];
    const packSessions = packSessionsResult.data || [];
    const alerts = alertsResult.data || [];

    const activeSubmissionsCount = submissions.filter(s => 
      s.status === 'submitted' || s.status === 'receiving'
    ).length;

    const totalItemsInStock = binItems.reduce((sum, item) => sum + item.quantity, 0);

    const recentOrdersFulfilled = packSessions.filter(p => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(p.created_at) >= oneWeekAgo;
    }).length;

    const openReceivingTasks = submissions.filter(s => s.status === 'receiving').length;

    const avgFulfillmentTimeMinutes = packSessions.length > 0 
      ? packSessions
          .filter(p => p.actual_time_minutes)
          .reduce((sum, p) => sum + p.actual_time_minutes, 0) / packSessions.length
      : 0;

    const recentActivity = submissions
      .slice(0, 5)
      .map(sub => ({
        type: 'submission_created' as const,
        description: `Inventory submission ${sub.status}`,
        timestamp: sub.created_at
      }));

    return {
      activeSubmissionsCount,
      totalItemsInStock,
      recentOrdersFulfilled,
      openReceivingTasks,
      lowStockAlertsCount: alerts.length,
      avgFulfillmentTimeMinutes,
      recentActivity
    };
  };

  const fetchProductManagementOverview = async (userId: string): Promise<ProductManagementOverview> => {
    const currentTime = new Date();
    const thirtyDaysAgo = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [editHistoryResult, syncStatusResult, marketplacesResult, productsResult] = await Promise.all([
      (supabase as any)
        .from('product_edit_history')
        .select('edit_type, created_at')
        .eq('user_id', userId)
        .eq('edit_type', 'ai_optimize'),
      supabase
        .from('marketplace_sync_status')
        .select('last_sync_at, products_synced')
        .eq('user_id', userId)
        .order('last_sync_at', { ascending: false })
        .limit(1),
      supabase
        .from('marketplace_configurations')
        .select('platform, is_active')
        .eq('user_id', userId)
        .eq('is_active', true),
      (supabase as any)
        .from('products')
        .select('id')
        .eq('user_id', userId)
    ]);

    const editHistory = (editHistoryResult.data as any) || [];
    const syncStatus = syncStatusResult.data?.[0];
    const marketplaces = marketplacesResult.data || [];
    const products = (productsResult.data as any) || [];

    const productsOptimizedCount = editHistory.filter(e => 
      new Date(e.created_at) >= thirtyDaysAgo
    ).length;

    // Calculate sync health based on last sync timing
    const syncCheckTime = new Date();
    const lastSync = syncStatus?.last_sync_at ? new Date(syncStatus.last_sync_at) : null;
    const hoursSinceLastSync = lastSync ? (syncCheckTime.getTime() - lastSync.getTime()) / (1000 * 60 * 60) : 999;
    
    const syncHealthScore = hoursSinceLastSync < 24 ? 100 : 
                           hoursSinceLastSync < 72 ? 75 : 
                           hoursSinceLastSync < 168 ? 50 : 25;

    const lastSyncStatus = syncStatus?.products_synced ? 'success' as const : 
                          lastSync ? 'error' as const : 
                          'pending' as const;

    const recentActivity = editHistory
      .slice(0, 5)
      .map(edit => ({
        type: 'product_optimized' as const,
        description: 'Product optimized with AI recommendations',
        timestamp: edit.created_at
      }));

    return {
      productsOptimizedCount,
      pendingDraftsCount: 0, // Would come from drafts table
      syncHealthScore,
      marketplacesConnected: marketplaces.length,
      lastSyncStatus,
      totalProductsManaged: products.length,
      recentActivity
    };
  };

  return useQuery<ModuleOverview>({
    queryKey: ['moduleOverview', effectiveUserId],
    queryFn: fetchModuleOverview,
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2
  });
};