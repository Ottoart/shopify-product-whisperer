import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

interface EditPattern {
  id: string;
  pattern_type: string;
  pattern_data: any;
  confidence_score: number;
  is_approved: boolean | null;
  needsApproval?: boolean;
}

export const usePatternLearning = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch user's edit patterns
  const { data: patterns, isLoading } = useQuery({
    queryKey: ['user-patterns'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_edit_patterns')
        .select('*')
        .eq('user_id', session.user.id)
        .order('confidence_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Analyze edit patterns
  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-edit-patterns');
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to analyze patterns');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-patterns'] });
      toast({
        title: "Pattern Analysis Complete",
        description: `Found ${data.patterns?.length || 0} editing patterns. Review and approve them to improve AI suggestions.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze edit patterns.",
        variant: "destructive",
      });
    },
  });

  // Approve/reject patterns
  const updatePatternMutation = useMutation({
    mutationFn: async ({ patternId, isApproved }: { patternId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from('user_edit_patterns')
        .update({ is_approved: isApproved })
        .eq('id', patternId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-patterns'] });
      toast({
        title: "Pattern Updated",
        description: "Your preference has been saved and will be used in future AI optimizations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update pattern.",
        variant: "destructive",
      });
    },
  });

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      await analyzePatternsMutation.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approvePattern = (patternId: string) => {
    updatePatternMutation.mutate({ patternId, isApproved: true });
  };

  const rejectPattern = (patternId: string) => {
    updatePatternMutation.mutate({ patternId, isApproved: false });
  };

  // Fetch edit history for review
  const { data: editHistory } = useQuery({
    queryKey: ['edit-history'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('product_edit_history')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('edit_type', 'manual')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Delete edit history entry
  const deleteEditMutation = useMutation({
    mutationFn: async (editId: string) => {
      const { error } = await supabase
        .from('product_edit_history')
        .delete()
        .eq('id', editId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-history'] });
      toast({
        title: "Edit Removed",
        description: "The erroneous edit has been removed. Re-analyze patterns to update your learning.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to remove edit.",
        variant: "destructive",
      });
    },
  });

  const deleteEdit = (editId: string) => {
    deleteEditMutation.mutate(editId);
  };

  const pendingPatterns = patterns?.filter(p => p.is_approved === null) || [];
  const approvedPatterns = patterns?.filter(p => p.is_approved === true) || [];

  return {
    patterns,
    pendingPatterns,
    approvedPatterns,
    editHistory: editHistory || [],
    isLoading,
    isAnalyzing: isAnalyzing || analyzePatternsMutation.isPending,
    analyzePatterns,
    approvePattern,
    rejectPattern,
    deleteEdit,
    isDeletingEdit: deleteEditMutation.isPending,
  };
};