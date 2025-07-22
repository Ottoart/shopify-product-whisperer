import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Brain, Check, X, Loader2, Lightbulb, Hash, BarChart3, Target, PieChart, Sparkles, Award, Eye, TrendingUp, Trash2 } from 'lucide-react';
import { usePatternLearning } from '@/hooks/usePatternLearning';

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

interface PatternManagementProps {
  onAnalyzePatterns?: () => void;
  isAnalyzing?: boolean;
}

export const PatternManagement = ({ onAnalyzePatterns, isAnalyzing }: PatternManagementProps) => {
  const { patterns, isLoading, approvePattern, rejectPattern } = usePatternLearning();

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
    
    return `AI learned this pattern from your editing behavior with ${Math.round(pattern.confidence_score * 100)}% confidence`;
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
          <span className="text-lg">Loading AI patterns...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              AI Learning Patterns
            </CardTitle>
            <CardDescription>
              Manage AI patterns learned from your editing behavior
            </CardDescription>
          </div>
          {onAnalyzePatterns && (
            <Button 
              onClick={onAnalyzePatterns}
              disabled={isAnalyzing}
              size="sm"
              className="bg-gradient-primary hover:shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Discover Patterns'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {patterns.length === 0 ? (
          <div className="text-center p-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">No Learning Patterns Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start editing products manually to generate AI learning patterns. 
              The more you edit, the smarter the AI becomes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {patterns.map((pattern) => {
              const { icon: Icon, color } = getPatternIcon(pattern.pattern_type);
              const metrics = getPatternMetrics(pattern);
              
              return (
                <Card key={pattern.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold capitalize">
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
                        {Math.round(pattern.confidence_score * 100)}%
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
                    <div className="grid grid-cols-3 gap-2">
                      {metrics.map((metric, idx) => (
                        <div key={idx} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <metric.icon className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{metric.label}</p>
                          <p className="text-xs font-medium">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Approval Controls */}
                    {pattern.is_approved === null ? (
                      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Apply to future AI suggestions?
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectPattern(pattern.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 h-6 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approvePattern(pattern.id)}
                            className="bg-green-600 hover:bg-green-700 text-white h-6 px-2"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={pattern.is_approved ? "default" : "destructive"} className="text-xs">
                            {pattern.is_approved ? "Active" : "Disabled"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {pattern.is_approved ? "AI applies this pattern" : "AI avoids this pattern"}
                          </span>
                        </div>
                        <Switch
                          checked={pattern.is_approved}
                          onCheckedChange={(checked) => 
                            checked ? approvePattern(pattern.id) : rejectPattern(pattern.id)
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};