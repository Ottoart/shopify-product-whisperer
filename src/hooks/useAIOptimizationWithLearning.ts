import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimizeWithLearningRequest {
  productHandle: string;
  productData: {
    title: string;
    type?: string;
    description?: string;
    tags?: string;
    vendor?: string;
    variant_price?: number;
    variant_compare_at_price?: number;
    variant_sku?: string;
    variant_barcode?: string;
    variant_grams?: number;
  };
  useDirectAI?: boolean;
  customPromptTemplate?: string;
}

export const useAIOptimizationWithLearning = () => {
  const { toast } = useToast();

  const optimizeMutation = useMutation({
    mutationFn: async (request: OptimizeWithLearningRequest) => {
      console.log('Starting AI optimization with learning patterns...');
      
      // The AI optimization function now automatically fetches and uses learned patterns
      const { data, error } = await supabase.functions.invoke('ai-optimize-product', {
        body: request
      });

      if (error) {
        console.error('AI optimization error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'AI optimization failed');
      }

      console.log('AI optimization completed with learned patterns applied');
      return data.optimizedData;
    },
    onSuccess: () => {
      toast({
        title: "AI Optimization Complete",
        description: "Product optimized using your learned preferences and AI intelligence.",
      });
    },
    onError: (error: any) => {
      console.error('Optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize product with AI.",
        variant: "destructive",
      });
    },
  });

  // Auto-trigger pattern analysis after manual edits
  const triggerPatternAnalysis = async () => {
    try {
      console.log('Triggering background pattern analysis...');
      const { error } = await supabase.functions.invoke('analyze-edit-patterns');
      if (error) {
        console.warn('Pattern analysis failed:', error);
      } else {
        console.log('Pattern analysis triggered successfully');
      }
    } catch (error) {
      console.warn('Failed to trigger pattern analysis:', error);
    }
  };

  return {
    optimizeWithLearning: optimizeMutation.mutate,
    optimizeWithLearningAsync: optimizeMutation.mutateAsync,
    isOptimizing: optimizeMutation.isPending,
    triggerPatternAnalysis,
  };
};