import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onUpdate?: (payload: any) => void;
}

export const useRealTimeUpdates = ({ 
  table, 
  event = '*', 
  filter, 
  onUpdate 
}: RealTimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes' as any, {
        event,
        schema: 'public',
        table,
        filter
      }, (payload: any) => {
        console.log(`Real-time update on ${table}:`, payload);
        onUpdate?.(payload);
        
        // Show notification for important updates
        if (table === 'ai_insights' && payload.eventType === 'INSERT') {
          toast({
            title: "New AI Insight",
            description: "A new AI insight has been generated for your account.",
          });
        }
        
        if (table === 'batch_operations' && payload.new?.status === 'failed') {
          toast({
            title: "Operation Failed",
            description: `Batch operation ${payload.new.operation_type} has failed.`,
            variant: "destructive",
          });
        }
      })
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${table}:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [table, event, filter, onUpdate, toast]);

  return { isConnected };
};

// Hook for AI insights real-time updates
export const useAIInsightsRealTime = (onNewInsight?: (insight: any) => void) => {
  return useRealTimeUpdates({
    table: 'ai_insights',
    event: 'INSERT',
    onUpdate: (payload) => {
      onNewInsight?.(payload.new);
    }
  });
};

// Hook for batch operations real-time updates
export const useBatchOperationsRealTime = (onOperationUpdate?: (operation: any) => void) => {
  return useRealTimeUpdates({
    table: 'batch_operations',
    event: 'UPDATE',
    onUpdate: (payload) => {
      onOperationUpdate?.(payload.new);
    }
  });
};

// Hook for performance metrics real-time updates
export const usePerformanceMetricsRealTime = (onMetricsUpdate?: (metrics: any) => void) => {
  return useRealTimeUpdates({
    table: 'performance_metrics',
    event: 'INSERT',
    onUpdate: (payload) => {
      onMetricsUpdate?.(payload.new);
    }
  });
};