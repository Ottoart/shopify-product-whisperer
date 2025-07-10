import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

interface ShopifyAnalytics {
  duplicates: Array<{
    type: string;
    products: any[];
    similarity: number;
    identifier: string;
  }>;
  unpublished: any[];
  missingImages: any[];
  missingDescriptions: any[];
  missingMetaTitles: any[];
  missingMetaDescriptions: any[];
  shortDescriptions: any[];
  longDescriptions: any[];
  topSellers: Array<{
    productId: number;
    product: any;
    sales: number;
    revenue: number;
  }>;
  zeroSales: any[];
  totalRevenue: number;
  totalOrders: number;
  lowStock: any[];
  outOfStock: any[];
  wellStocked: any[];
  tagAnalysis: {
    popularTags: Array<{ tag: string; count: number }>;
    untagged: any[];
  };
  categoryAnalysis: {
    productTypes: Array<{ type: string; count: number }>;
    uncategorized: any[];
  };
  vendorAnalysis: {
    vendors: Array<{ vendor: string; count: number }>;
    noVendor: any[];
  };
  products: any[];
  orders: any[];
  lastUpdated: string;
}

export const useShopifyAnalytics = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get stored Shopify credentials
  const getShopifyCredentials = () => {
    const storeUrl = localStorage.getItem('shopify_domain');
    const accessToken = localStorage.getItem('shopify_access_token');
    return { storeUrl, accessToken };
  };

  // Fetch analytics data from database
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['shopify-analytics'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('shopify_analytics')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch fresh data from Shopify
  const refreshAnalyticsMutation = useMutation({
    mutationFn: async () => {
      const { storeUrl, accessToken } = getShopifyCredentials();
      
      if (!storeUrl || !accessToken) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('fetch-shopify-analytics', {
        body: { storeUrl, accessToken }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-analytics'] });
      toast({
        title: "Analytics Updated",
        description: data.message || "Successfully refreshed analytics data from Shopify.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh analytics data.",
        variant: "destructive",
      });
    },
  });

  // Auto-refresh every hour
  useEffect(() => {
    const { storeUrl, accessToken } = getShopifyCredentials();
    
    if (!storeUrl || !accessToken || !session?.user?.id) return;

    // Check if data is older than 1 hour
    const shouldAutoRefresh = () => {
      if (!analyticsData?.last_updated) return true;
      
      const lastUpdated = new Date(analyticsData.last_updated);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return lastUpdated < oneHourAgo;
    };

    // Initial check and setup interval
    if (shouldAutoRefresh()) {
      refreshAnalyticsMutation.mutate();
    }

    const interval = setInterval(() => {
      if (shouldAutoRefresh()) {
        refreshAnalyticsMutation.mutate();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [session?.user?.id, analyticsData?.last_updated]);

  // Manual refresh function
  const refreshNow = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalyticsMutation.mutateAsync();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Parse analytics data
  const analytics: ShopifyAnalytics | null = (analyticsData?.analytics_data as unknown) as ShopifyAnalytics || null;

  // Check if credentials are available
  const hasCredentials = () => {
    const { storeUrl, accessToken } = getShopifyCredentials();
    return !!(storeUrl && accessToken);
  };

  return {
    analytics,
    isLoading,
    error,
    refreshNow,
    isRefreshing: isRefreshing || refreshAnalyticsMutation.isPending,
    hasCredentials: hasCredentials(),
    lastUpdated: analyticsData?.last_updated,
  };
};