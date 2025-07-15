import { useState, useEffect } from 'react';
import { useTabPersistence } from "@/hooks/useTabPersistence";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  Target,
  Zap,
  BarChart3,
  PieChart,
  Eye,
  Lightbulb,
  Sparkles,
  Award,
  Timer,
  Hash,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react';
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
  created_at: string;
}

interface EditExample {
  id: string;
  product_handle: string;
  field_name: string;
  before_value: string;
  after_value: string;
  created_at: string;
}

interface PatternStats {
  totalPatterns: number;
  approvedPatterns: number;
  avgConfidence: number;
  mostFrequentType: string;
  recentActivity: number;
}

export const LearningDashboard = () => {
  const [patterns, setPatterns] = useState<EditPattern[]>([]);
  const [editExamples, setEditExamples] = useState<Record<string, EditExample[]>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingExamples, setIsRefreshingExamples] = useState(false);
  const [stats, setStats] = useState<PatternStats | null>(null);
  const [isDeletingEdit, setIsDeletingEdit] = useState<string | null>(null);
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useTabPersistence('learning-dashboard', 'overview');

  useEffect(() => {
    console.log('Session user ID:', session?.user?.id);
    console.log('Expected user ID from patterns:', '3a393edd-271d-4d32-b18d-e10fce7ee248');
    if (session?.user?.id) {
      loadPatterns();
    }
  }, [session?.user?.id]);

  const loadPatterns = async (showProgress = false) => {
    if (showProgress) {
      toast({
        title: "🧠 Loading AI Patterns",
        description: "Fetching your learned editing patterns...",
      });
    }
    
    try {
      console.log('Loading patterns for user:', session?.user?.id);
      const { data, error } = await supabase
        .from('user_edit_patterns')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      console.log('Query result:', { data, error });
      if (error) throw error;
      
      const patternsData = data || [];
      console.log('Patterns loaded:', patternsData.length);
      setPatterns(patternsData);
      
      if (showProgress) {
        toast({
          title: "📊 Analyzing Pattern Data",
          description: `Processing ${patternsData.length} patterns and loading examples...`,
        });
      }
      
      // Load edit examples for each pattern type
      await loadEditExamples(patternsData, showProgress);
      
      // Calculate stats
      if (patternsData.length > 0) {
        const approved = patternsData.filter(p => p.is_approved === true).length;
        const avgConf = patternsData.reduce((sum, p) => sum + p.confidence_score, 0) / patternsData.length;
        
        const typeCount: Record<string, number> = {};
        patternsData.forEach(p => {
          typeCount[p.pattern_type] = (typeCount[p.pattern_type] || 0) + 1;
        });
        
        const mostFrequent = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
        
        const recentCount = patternsData.filter(p => {
          const created = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created > weekAgo;
        }).length;

        setStats({
          totalPatterns: patternsData.length,
          approvedPatterns: approved,
          avgConfidence: avgConf,
          mostFrequentType: mostFrequent,
          recentActivity: recentCount
        });
        
        if (showProgress) {
          toast({
            title: "✅ Dashboard Updated",
            description: `Loaded ${patternsData.length} patterns with ${approved} approved. Average confidence: ${Math.round(avgConf * 100)}%`,
          });
        }
      } else if (showProgress) {
        toast({
          title: "📭 No Patterns Found",
          description: "Start editing products manually to generate AI learning patterns.",
        });
      }
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

  const loadEditExamples = async (patternsData: EditPattern[], showProgress = false) => {
    if (showProgress) {
      setIsRefreshingExamples(true);
      toast({
        title: "🔄 Refreshing Examples",
        description: "Loading latest edit examples for all patterns...",
      });
    }
    
    try {
      const examples: Record<string, EditExample[]> = {};
      
      // Get unique pattern types
      const patternTypes = [...new Set(patternsData.map(p => p.pattern_type))];
      
      for (let i = 0; i < patternTypes.length; i++) {
        const patternType = patternTypes[i];
        
        if (showProgress) {
          toast({
            title: `📋 Loading Examples (${i + 1}/${patternTypes.length})`,
            description: `Fetching examples for ${patternType.replace(/_/g, ' ')} pattern...`,
          });
        }
        
        // Map pattern type to field names
        const fieldName = getFieldNameForPatternType(patternType);
        
        const { data, error } = await supabase
          .from('product_edit_history')
          .select('*')
          .eq('user_id', session?.user?.id)
          .eq('field_name', fieldName)
          .eq('edit_type', 'manual')
          .order('created_at', { ascending: false })
          .limit(8); // Get up to 8 examples per pattern type

        if (error) {
          console.error('Error loading edit examples:', error);
          continue;
        }

        if (data) {
          examples[patternType] = data;
        }
      }
      
      setEditExamples(examples);
      
      if (showProgress) {
        const totalExamples = Object.values(examples).reduce((sum, exs) => sum + exs.length, 0);
        toast({
          title: "✅ Examples Refreshed",
          description: `Loaded ${totalExamples} examples across ${patternTypes.length} pattern types.`,
        });
      }
    } catch (error) {
      console.error('Error loading edit examples:', error);
      if (showProgress) {
        toast({
          title: "❌ Refresh Failed",
          description: "Failed to refresh examples. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (showProgress) {
        setIsRefreshingExamples(false);
      }
    }
  };

  const getFieldNameForPatternType = (patternType: string): string => {
    switch (patternType) {
      case 'title_style': return 'title';
      case 'description_formatting': return 'description';
      case 'tag_preferences': return 'tags';
      case 'type_categorization': return 'type';
      default: return 'title';
    }
  };

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      toast({
        title: "🔬 Starting AI Analysis",
        description: "Analyzing your editing history to discover new patterns...",
      });
      
      console.log('Calling analyze-edit-patterns function...');
      const { data, error } = await supabase.functions.invoke('analyze-edit-patterns');

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data?.patterns && data.patterns.length > 0) {
        console.log('Patterns found:', data.patterns);
        toast({
          title: "🧠 AI Analysis Complete!",
          description: `Discovered ${data.patterns.length} new learning patterns from your edits.`,
        });
        
        toast({
          title: "📊 Updating Dashboard",
          description: "Refreshing patterns and examples with new discoveries...",
        });
        
        await loadPatterns(true);
      } else {
        console.log('No patterns found, data:', data);
        toast({
          title: "🔍 Analysis Complete",
          description: data?.message || "No new patterns found. Continue editing to build more patterns.",
        });
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "❌ Analysis Failed",
        description: `Failed to analyze editing patterns: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteEditExample = async (editId: string) => {
    setIsDeletingEdit(editId);
    
    toast({
      title: "🗑️ Removing Edit Example",
      description: "Deleting selected example and updating patterns...",
    });
    
    try {
      const { error } = await supabase
        .from('product_edit_history')
        .delete()
        .eq('id', editId);

      if (error) throw error;

      toast({
        title: "📊 Updating Examples",
        description: "Refreshing examples display after deletion...",
      });

      // Update local state immediately
      setEditExamples(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(patternType => {
          updated[patternType] = updated[patternType].filter(ex => ex.id !== editId);
        });
        return updated;
      });

      // Reload examples and patterns to ensure accuracy
      await loadEditExamples(patterns, true);
      await loadPatterns(true); // Refresh patterns as they may be affected
      
      toast({
        title: "✅ Edit Removed Successfully",
        description: "Example deleted and patterns updated automatically.",
      });
    } catch (error) {
      console.error('Error deleting edit:', error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to remove edit example.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEdit(null);
    }
  };

  const updatePatternApproval = async (patternId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('user_edit_patterns')
        .update({ 
          is_approved: isApproved,
          updated_at: new Date().toISOString()
        })
        .eq('id', patternId);

      if (error) throw error;

      // Update local state immediately
      setPatterns(prev => 
        prev.map(p => 
          p.id === patternId ? { 
            ...p, 
            is_approved: isApproved,
            updated_at: new Date().toISOString()
          } : p
        )
      );

      toast({
        title: isApproved ? "✅ Pattern Approved" : "❌ Pattern Rejected",
        description: isApproved ? "AI will apply this style to future optimizations" : "AI will avoid this pattern",
      });
      
      // Reload to update stats and ensure consistency
      await loadPatterns();
    } catch (error) {
      console.error('Error updating pattern:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update pattern approval.",
        variant: "destructive",
      });
    }
  };

  const updatePatternData = async (patternId: string, newData: any) => {
    try {
      const { error } = await supabase
        .from('user_edit_patterns')
        .update({ 
          pattern_data: newData,
          updated_at: new Date().toISOString()
        })
        .eq('id', patternId);

      if (error) throw error;

      // Update local state
      setPatterns(prev => 
        prev.map(p => 
          p.id === patternId ? { 
            ...p, 
            pattern_data: newData,
            updated_at: new Date().toISOString()
          } : p
        )
      );

      toast({
        title: "Pattern Updated",
        description: "Pattern data has been successfully updated.",
      });
      
      await loadPatterns();
    } catch (error) {
      console.error('Error updating pattern data:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update pattern data.",
        variant: "destructive",
      });
    }
  };

  const updatePatternExamples = async (patternId: string, newExamples: string[]) => {
    try {
      // Get the current pattern data
      const pattern = patterns.find(p => p.id === patternId);
      if (!pattern) return;

      // Update the pattern_data with new examples
      const updatedPatternData = {
        ...pattern.pattern_data,
        examples: newExamples
      };

      await updatePatternData(patternId, updatedPatternData);

      toast({
        title: "Example Removed",
        description: "Pattern example has been removed successfully.",
      });
    } catch (error) {
      console.error('Error updating pattern examples:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update pattern examples.",
        variant: "destructive",
      });
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'title_style': return { icon: Hash, color: 'text-blue-500' };
      case 'description_formatting': return { icon: BarChart3, color: 'text-green-500' };
      case 'tag_preferences': return { icon: Target, color: 'text-purple-500' };
      case 'type_categorization': return { icon: PieChart, color: 'text-orange-500' };
      default: return { icon: Sparkles, color: 'text-gray-500' };
    }
  };

  const getPatternMetrics = (pattern: EditPattern) => {
    const data = pattern.pattern_data;
    const metrics: Array<{ label: string; value: string; icon: any }> = [];

    switch (pattern.pattern_type) {
      case 'title_style':
        metrics.push(
          { label: 'Max Length', value: `${data?.max_length || 60} chars`, icon: Hash },
          { label: 'Style', value: data?.style || 'Custom', icon: Sparkles },
          { label: 'Separators', value: data?.separators?.join(', ') || 'Various', icon: Target }
        );
        break;
      case 'description_formatting':
        metrics.push(
          { label: 'Tone', value: data?.tone || 'Professional', icon: Award },
          { label: 'Length', value: data?.length || 'Medium', icon: BarChart3 },
          { label: 'Format', value: data?.format || 'HTML', icon: Eye }
        );
        break;
      case 'tag_preferences':
        metrics.push(
          { label: 'Categories', value: `${data?.categories?.length || 0} types`, icon: Hash },
          { label: 'Naming', value: data?.naming_convention || 'Custom', icon: Target },
          { label: 'Density', value: data?.tag_density || 'High', icon: TrendingUp }
        );
        break;
      case 'type_categorization':
        metrics.push(
          { label: 'Style', value: data?.style || 'Descriptive', icon: Award },
          { label: 'Length', value: data?.length || 'Medium', icon: BarChart3 },
          { label: 'Focus', value: data?.focus?.join(', ') || 'Quality', icon: Target }
        );
        break;
    }

    return metrics;
  };

  const getDetailedDescription = (pattern: EditPattern) => {
    if (pattern.description) return pattern.description;
    
    const baseDesc = getPatternMetrics(pattern);
    return `AI learned this pattern from your editing behavior with ${Math.round(pattern.confidence_score * 100)}% confidence`;
  };

  const getExampleChanges = (pattern: EditPattern) => {
    const data = pattern.pattern_data;
    
    switch (pattern.pattern_type) {
      case 'title_style':
        return data?.examples || ['Example titles with your preferred format'];
      case 'description_formatting':
        return data?.structure || ['Structured descriptions with your preferred sections'];
      case 'tag_preferences':
        return data?.examples || ['Brand_Name, Type_Category, Benefits_Feature'];
      case 'type_categorization':
        return data?.examples || ['Descriptive product types with key attributes'];
      default:
        return ['AI will apply learned preferences to future optimizations'];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-card">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
            <span className="text-lg">Analyzing AI learning patterns...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Patterns</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalPatterns}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approvedPatterns}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Confidence</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{Math.round(stats.avgConfidence * 100)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Recent Activity</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.recentActivity}</p>
                </div>
                <Timer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                AI Learning Intelligence
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Advanced pattern recognition from your product editing behavior
              </CardDescription>
            </div>
            <Button 
              onClick={analyzePatterns}
              disabled={isAnalyzing}
              size="lg"
              className="bg-gradient-primary hover:shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="h-5 w-5 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Discover New Patterns'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {patterns.length === 0 ? (
            <div className="text-center p-12 space-y-4">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <Brain className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Ready to Learn From You!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start editing products manually and our AI will learn your unique style preferences. 
                The more you edit, the smarter the AI becomes at matching your brand voice.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                <Zap className="h-4 w-4" />
                <span>AI learns from every edit you make</span>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {patterns.map((pattern) => {
                    const { icon: Icon, color } = getPatternIcon(pattern.pattern_type);
                    const metrics = getPatternMetrics(pattern);
                    
                    return (
                      <Card key={pattern.id} className="border-0 shadow-card hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg capitalize">
                                  {pattern.pattern_type.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  {getDetailedDescription(pattern)}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${pattern.confidence_score >= 0.8 ? 'border-green-500 text-green-700 bg-green-50' : 
                                  pattern.confidence_score >= 0.6 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 
                                  'border-red-500 text-red-700 bg-red-50'}
                              `}
                            >
                              {Math.round(pattern.confidence_score * 100)}% confident
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Confidence Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Confidence Level</span>
                              <span className="font-medium">{Math.round(pattern.confidence_score * 100)}%</span>
                            </div>
                            <Progress 
                              value={pattern.confidence_score * 100} 
                              className="h-2"
                            />
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            {metrics.map((metric, idx) => (
                              <div key={idx} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <metric.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <p className="text-sm font-medium">{metric.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Approval Controls */}
                          {pattern.is_approved === null ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  Apply this pattern to future AI suggestions?
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePatternApproval(pattern.id, false)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updatePatternApproval(pattern.id, true)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge variant={pattern.is_approved ? "default" : "destructive"}>
                                  {pattern.is_approved ? "✅ Active" : "❌ Disabled"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {pattern.is_approved ? "AI will apply this pattern" : "AI will avoid this pattern"}
                                </span>
                              </div>
                              <Switch
                                checked={pattern.is_approved}
                                onCheckedChange={(checked) => updatePatternApproval(pattern.id, checked)}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4">
                <Tabs defaultValue={patterns[0]?.pattern_type || "title_style"} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4 max-w-4xl mx-auto">
                    {patterns.map((pattern) => (
                      <TabsTrigger 
                        key={pattern.pattern_type} 
                        value={pattern.pattern_type}
                        className="text-xs"
                      >
                        {pattern.pattern_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {patterns.map((pattern) => (
                    <TabsContent key={pattern.pattern_type} value={pattern.pattern_type} className="space-y-6">
                      <Card className="border-0 shadow-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="capitalize text-lg">
                              {pattern.pattern_type.replace(/_/g, ' ')} Pattern
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${pattern.confidence_score >= 0.8 ? 'border-green-500 text-green-700 bg-green-50' : 
                                  pattern.confidence_score >= 0.6 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 
                                  'border-red-500 text-red-700 bg-red-50'}
                              `}
                            >
                              {Math.round(pattern.confidence_score * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {getDetailedDescription(pattern)}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Pattern Data Examples */}
                          {pattern.pattern_data?.examples && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                  Pattern Examples ({pattern.pattern_data.examples.length} available):
                                </h5>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={pattern.is_approved}
                                    onCheckedChange={(checked) => updatePatternApproval(pattern.id, checked)}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {pattern.is_approved ? "Active" : "Disabled"}
                                  </span>
                                </div>
                              </div>
                              <div className="grid gap-3">
                                {pattern.pattern_data.examples.map((example, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border hover:shadow-sm transition-all group"
                                  >
                                    <div className="flex-1">
                                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                        {example}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          Example {idx + 1}
                                        </Badge>
                                        {pattern.pattern_data.format && (
                                          <span className="text-xs text-muted-foreground">
                                            Follows: {pattern.pattern_data.format}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          // Remove this example from pattern_data
                                          const newExamples = pattern.pattern_data.examples.filter((_, i) => i !== idx);
                                          updatePatternExamples(pattern.id, newExamples);
                                        }}
                                        className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0"
                                        title="Remove this example"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(example);
                                          toast({
                                            title: "Copied!",
                                            description: "Example copied to clipboard",
                                          });
                                        }}
                                        className="h-8 w-8 p-0"
                                        title="Copy example"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pattern Details */}
                          {pattern.pattern_data && Object.keys(pattern.pattern_data).filter(key => key !== 'examples').length > 0 && (
                            <div className="space-y-4">
                              <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                Pattern Details:
                              </h5>
                              <div className="grid gap-3">
                                {Object.entries(pattern.pattern_data)
                                  .filter(([key]) => key !== 'examples')
                                  .map(([key, value]) => (
                                    <div key={key} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                                        {key.replace(/_/g, ' ')}:
                                      </div>
                                      <div className="text-sm text-blue-800 dark:text-blue-200">
                                        {Array.isArray(value) ? (
                                          <div className="space-y-1">
                                            {value.map((item, idx) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                <span className="font-mono">{item}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="font-mono">{String(value)}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Edit History Examples */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                Your Edit History ({editExamples[pattern.pattern_type]?.length || 0} found):
                              </h5>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadEditExamples(patterns, true)}
                                disabled={isRefreshingExamples}
                                className="text-xs h-8"
                                title="Refresh examples from database"
                              >
                                {isRefreshingExamples ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Refreshing...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Refresh
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {editExamples[pattern.pattern_type]?.length > 0 ? (
                                editExamples[pattern.pattern_type].map((example, idx) => (
                                  <div key={example.id} className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border hover:shadow-sm transition-shadow">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          Product: {example.product_handle}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(example.created_at).toLocaleDateString()}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          #{idx + 1}
                                        </Badge>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteEditExample(example.id)}
                                        disabled={isDeletingEdit === example.id}
                                        className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0"
                                        title="Remove this example"
                                      >
                                        {isDeletingEdit === example.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Before ({example.field_name}):</div>
                                        <div className="text-sm text-red-800 dark:text-red-200 font-mono break-all">
                                          {example.before_value || '(Empty)'}
                                        </div>
                                      </div>
                                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                                        <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">After ({example.field_name}):</div>
                                        <div className="text-sm text-green-800 dark:text-green-200 font-mono break-all">
                                          {example.after_value || '(Empty)'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                                    No specific examples found for this pattern type.
                                  </p>
                                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                    AI learned this pattern from your general editing behavior.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Learning Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{patterns.length}</div>
                        <p className="text-muted-foreground">Patterns Discovered</p>
                      </div>
                      <Progress value={(stats?.approvedPatterns || 0) / patterns.length * 100} className="h-3" />
                      <p className="text-sm text-center text-muted-foreground">
                        {stats?.approvedPatterns || 0} of {patterns.length} patterns approved
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        AI Intelligence Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {stats?.avgConfidence ? Math.round(stats.avgConfidence * 100) : 0}%
                        </div>
                        <p className="text-muted-foreground">Average Confidence</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline" className="text-sm">
                          {stats?.avgConfidence && stats.avgConfidence > 0.8 ? '🔥 Expert Level' :
                           stats?.avgConfidence && stats.avgConfidence > 0.6 ? '⚡ Learning Fast' :
                           '🌱 Getting Started'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h5 className="font-medium mb-2">Most Learned Pattern</h5>
                        <p className="text-sm text-muted-foreground capitalize">
                          {stats?.mostFrequentType.replace(/_/g, ' ') || 'None yet'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h5 className="font-medium mb-2">Recent Activity</h5>
                        <p className="text-sm text-muted-foreground">
                          {stats?.recentActivity || 0} patterns learned this week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};