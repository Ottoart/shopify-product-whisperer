import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface BulkOperationData {
  id: string;
  operation_type: string;
  status: string;
  query?: string;
  url?: string;
  object_count?: number;
  file_size?: number;
  error_code?: string;
  completed_at?: string;
  created_at: string;
}

export const useShopifyBulkOperations = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { storeUrl, accessToken } = useShopifyCredentials();

  // Clean token helper
  const cleanAccessToken = (token?: string | null) => {
    if (!token) return null;
    try {
      const parsed = JSON.parse(token);
      token = parsed.access_token || parsed.accessToken || token;
    } catch {}
    return token.toString().trim().split(' ')[0];
  };

  // Get bulk operations
  const { data: bulkOperations, isLoading: operationsLoading } = useQuery({
    queryKey: ['shopify-bulk-operations'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('shopify_bulk_operations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as BulkOperationData[] || [];
    },
    enabled: Boolean(session?.user?.id),
  });

  // Start bulk operation mutation
  const startBulkOperationMutation = useMutation({
    mutationFn: async ({ query }: { query: string }) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('shopify-bulk-operations', {
        body: { 
          storeUrl, 
          accessToken: token,
          operationType: 'start',
          query
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to start bulk operation');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-bulk-operations'] });
      toast({
        title: "Bulk Operation Started",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Operation Failed",
        description: error.message || "Failed to start bulk operation.",
        variant: "destructive",
      });
    },
  });

  // Check bulk operation status mutation
  const checkBulkOperationMutation = useMutation({
    mutationFn: async ({ bulkOperationId }: { bulkOperationId: string }) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('shopify-bulk-operations', {
        body: { 
          storeUrl, 
          accessToken: token,
          operationType: 'check',
          bulkOperationId
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to check bulk operation');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-bulk-operations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Check Operation Failed",
        description: error.message || "Failed to check bulk operation status.",
        variant: "destructive",
      });
    },
  });

  // Download bulk operation data mutation
  const downloadBulkDataMutation = useMutation({
    mutationFn: async ({ bulkOperationId }: { bulkOperationId: string }) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('shopify-bulk-operations', {
        body: { 
          storeUrl, 
          accessToken: token,
          operationType: 'download',
          bulkOperationId
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to download bulk data');

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Data Downloaded",
        description: `Downloaded ${data.recordCount} records (${data.dataSize} bytes)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download bulk operation data.",
        variant: "destructive",
      });
    },
  });

  // Predefined GraphQL queries for common operations
  const predefinedQueries = {
    products: `
      {
        products {
          edges {
            node {
              id
              title
              handle
              status
              createdAt
              updatedAt
              variants {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `,
    orders: `
      {
        orders {
          edges {
            node {
              id
              name
              email
              createdAt
              updatedAt
              totalPrice
              fulfillmentStatus
              lineItems {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      sku
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    customers: `
      {
        customers {
          edges {
            node {
              id
              email
              firstName
              lastName
              createdAt
              updatedAt
              ordersCount
              totalSpent
            }
          }
        }
      }
    `
  };

  return {
    // Data
    bulkOperations,
    predefinedQueries,
    
    // Loading states
    operationsLoading,
    isStarting: startBulkOperationMutation.isPending,
    isChecking: checkBulkOperationMutation.isPending,
    isDownloading: downloadBulkDataMutation.isPending,
    
    // Actions
    startBulkOperation: startBulkOperationMutation.mutateAsync,
    checkBulkOperation: checkBulkOperationMutation.mutateAsync,
    downloadBulkData: downloadBulkDataMutation.mutateAsync,
    
    // Helpers
    hasCredentials: Boolean(storeUrl && accessToken),
  };
};