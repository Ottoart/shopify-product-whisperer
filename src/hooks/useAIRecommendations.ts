import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendation {
  id: string;
  type: 'pricing' | 'categorization' | 'competitive' | 'general';
  title: string;
  description: string;
  confidence_score: number;
  impact: 'low' | 'medium' | 'high';
  action_items: string[];
  data_points: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  is_read: boolean;
}

interface AIAnalysisRequest {
  productId?: string;
  analysisType: 'pricing' | 'categorization' | 'competitive';
  options?: {
    includeCompetitors?: boolean;
    priceRange?: { min: number; max: number };
    categoryDepth?: number;
  };
}

export const useAIRecommendations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all recommendations
  const {
    data: recommendations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        type: item.insight_type as 'pricing' | 'categorization' | 'competitive' | 'general',
        impact: 'medium' as 'low' | 'medium' | 'high'
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Generate new AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: async ({ productId, analysisType, options }: AIAnalysisRequest) => {
      let functionName = '';
      
      switch (analysisType) {
        case 'pricing':
          functionName = 'ai-pricing-optimizer';
          break;
        case 'categorization':
          functionName = 'ai-product-categorizer';
          break;
        case 'competitive':
          functionName = 'ai-competitive-analyzer';
          break;
        default:
          throw new Error('Invalid analysis type');
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          productId,
          options: options || {}
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "AI Analysis Complete",
        description: `Generated new ${variables.analysisType} recommendations`,
      });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
    onError: (error: any, variables) => {
      console.error(`Error generating ${variables.analysisType} recommendations:`, error);
      toast({
        title: "Analysis Failed",
        description: `Failed to generate ${variables.analysisType} recommendations`,
        variant: "destructive"
      });
    },
  });

  // Mark recommendation as read
  const markAsReadMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', recommendationId);

      if (error) throw error;
      return recommendationId;
    },
    onSuccess: (recommendationId) => {
      queryClient.setQueryData(['ai-recommendations'], (old: AIRecommendation[] | undefined) => {
        if (!old) return old;
        return old.map(rec => 
          rec.id === recommendationId ? { ...rec, is_read: true } : rec
        );
      });
    },
    onError: (error) => {
      console.error('Error marking recommendation as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark recommendation as read",
        variant: "destructive"
      });
    },
  });

  // Mark all recommendations as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: "Success",
        description: "All recommendations marked as read",
      });
    },
    onError: (error) => {
      console.error('Error marking all recommendations as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all recommendations as read",
        variant: "destructive"
      });
    },
  });

  // Delete recommendation
  const deleteRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('ai_insights')
        .delete()
        .eq('id', recommendationId);

      if (error) throw error;
      return recommendationId;
    },
    onSuccess: (recommendationId) => {
      queryClient.setQueryData(['ai-recommendations'], (old: AIRecommendation[] | undefined) => {
        if (!old) return old;
        return old.filter(rec => rec.id !== recommendationId);
      });
      toast({
        title: "Success",
        description: "Recommendation deleted",
      });
    },
    onError: (error) => {
      console.error('Error deleting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive"
      });
    },
  });

  // Computed values
  const unreadCount = recommendations.filter(r => !r.is_read).length;
  const pricingRecommendations = recommendations.filter(r => r.type === 'pricing');
  const categorizationRecommendations = recommendations.filter(r => r.type === 'categorization');
  const competitiveRecommendations = recommendations.filter(r => r.type === 'competitive');
  const generalRecommendations = recommendations.filter(r => r.type === 'general');
  
  const highPriorityAlerts = recommendations.filter(r => 
    ['high', 'critical'].includes(r.priority) && !r.is_read
  ).length;

  const avgConfidenceScore = recommendations.length > 0 
    ? recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length
    : 0;

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    // Data
    recommendations,
    pricingRecommendations,
    categorizationRecommendations,
    competitiveRecommendations,
    generalRecommendations,
    
    // Computed values
    unreadCount,
    highPriorityAlerts,
    avgConfidenceScore,
    
    // Loading states
    isLoading,
    isGenerating: generateRecommendationsMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeletingRecommendation: deleteRecommendationMutation.isPending,
    
    // Actions
    generateRecommendations: generateRecommendationsMutation.mutate,
    generateRecommendationsAsync: generateRecommendationsMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteRecommendation: deleteRecommendationMutation.mutate,
    refetch,
    
    // Error handling
    error: error || generateRecommendationsMutation.error,
  };
};

// Hook for real-time AI insights
export const useRealTimeAIInsights = () => {
  const [insights, setInsights] = useState<AIRecommendation[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('ai_insights_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights'
        },
        (payload) => {
          console.log('Real-time AI insight update:', payload);
          
          // Invalidate and refetch recommendations
          queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
          
          // Update local state if needed
          if (payload.eventType === 'INSERT') {
            setInsights(prev => [payload.new as AIRecommendation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setInsights(prev => prev.map(insight => 
              insight.id === payload.new.id ? payload.new as AIRecommendation : insight
            ));
          } else if (payload.eventType === 'DELETE') {
            setInsights(prev => prev.filter(insight => insight.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return insights;
};

// Hook for AI analysis progress tracking
export const useAIAnalysisProgress = () => {
  const [progress, setProgress] = useState<{
    isAnalyzing: boolean;
    currentStep: string;
    progress: number;
    estimatedTime: number;
  }>({
    isAnalyzing: false,
    currentStep: '',
    progress: 0,
    estimatedTime: 0
  });

  const startAnalysis = (type: string, estimatedSteps: number) => {
    setProgress({
      isAnalyzing: true,
      currentStep: `Starting ${type} analysis...`,
      progress: 0,
      estimatedTime: estimatedSteps * 10 // Rough estimate: 10 seconds per step
    });
  };

  const updateProgress = (step: string, progressPercent: number) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
      progress: progressPercent
    }));
  };

  const completeAnalysis = () => {
    setProgress({
      isAnalyzing: false,
      currentStep: 'Analysis complete',
      progress: 100,
      estimatedTime: 0
    });
  };

  return {
    progress,
    startAnalysis,
    updateProgress,
    completeAnalysis
  };
};