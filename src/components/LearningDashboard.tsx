import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Check, X, Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';

interface EditPattern {
  id: string;
  pattern_type: string;
  pattern_data: any;
  confidence_score: number;
  usage_count: number;
  is_approved: boolean | null;
  description?: string;
}

export const LearningDashboard = () => {
  const [patterns, setPatterns] = useState<EditPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useSessionContext();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      loadPatterns();
    }
  }, [session?.user?.id]);

  const loadPatterns = async () => {
    try {
      const { data, error } = await supabase
        .from('user_edit_patterns')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error('Error loading patterns:', error);
      toast({
        title: "Failed to load patterns",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-edit-patterns');

      if (error) throw error;

      if (data.patterns && data.patterns.length > 0) {
        toast({
          title: "Patterns Analyzed",
          description: `Found ${data.patterns.length} editing patterns.`,
        });
        await loadPatterns();
      } else {
        toast({
          title: "No Patterns Found",
          description: data.message || "Make more manual edits to build patterns.",
        });
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze editing patterns.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updatePatternApproval = async (patternId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('user_edit_patterns')
        .update({ is_approved: isApproved })
        .eq('id', patternId);

      if (error) throw error;

      setPatterns(prev => 
        prev.map(p => 
          p.id === patternId ? { ...p, is_approved: isApproved } : p
        )
      );

      toast({
        title: isApproved ? "Pattern Approved" : "Pattern Rejected",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error('Error updating pattern:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update pattern approval.",
        variant: "destructive",
      });
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'title_style': return '📝';
      case 'description_format': return '📄';
      case 'tag_preference': return '🏷️';
      case 'type_categorization': return '📂';
      default: return '⚙️';
    }
  };

  const getPatternDescription = (pattern: EditPattern) => {
    if (pattern.description) return pattern.description;
    
    switch (pattern.pattern_type) {
      case 'title_style':
        return `Title style preferences (avg length: ${pattern.pattern_data?.avg_length || 'unknown'})`;
      case 'description_format':
        return `Description formatting patterns (tone: ${pattern.pattern_data?.tone || 'unknown'})`;
      case 'tag_preference':
        return `Tag categorization preferences (${pattern.pattern_data?.categories?.length || 0} categories)`;
      case 'type_categorization':
        return `Product type categorization patterns`;
      default:
        return `${pattern.pattern_type} preferences`;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading patterns...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Learning Dashboard
        </CardTitle>
        <CardDescription>
          Track and manage AI learning from your manual product edits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {patterns.length} patterns detected
          </div>
          <Button 
            onClick={analyzePatterns}
            disabled={isAnalyzing}
            className="bg-gradient-primary"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Analyze Patterns
          </Button>
        </div>

        {patterns.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Learning Patterns Yet</h3>
            <p className="text-sm">
              Start making manual edits to products and the AI will learn your preferences.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getPatternIcon(pattern.pattern_type)}</span>
                    <div>
                      <h4 className="font-medium capitalize">
                        {pattern.pattern_type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {getPatternDescription(pattern)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {Math.round(pattern.confidence_score * 100)}% confidence
                    </Badge>
                  </div>
                </div>

                {pattern.is_approved === null && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Use this pattern for future AI suggestions?
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePatternApproval(pattern.id, false)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updatePatternApproval(pattern.id, true)}
                        className="bg-gradient-primary"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}

                {pattern.is_approved !== null && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant={pattern.is_approved ? "default" : "destructive"}>
                      {pattern.is_approved ? "Approved" : "Rejected"}
                    </Badge>
                    <Switch
                      checked={pattern.is_approved}
                      onCheckedChange={(checked) => updatePatternApproval(pattern.id, checked)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};