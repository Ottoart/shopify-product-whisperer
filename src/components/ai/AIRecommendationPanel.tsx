import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  Zap,
  BarChart3,
  ShoppingCart
} from "lucide-react";

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

interface AIRecommendationPanelProps {
  productId?: string;
  showGeneral?: boolean;
}

export const AIRecommendationPanel = ({ productId, showGeneral = true }: AIRecommendationPanelProps) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRecommendation, setProcessingRecommendation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.insight_type as 'pricing' | 'categorization' | 'competitive' | 'general',
        impact: 'medium' as 'low' | 'medium' | 'high',
        priority: (item.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical'
      }));
      setRecommendations(transformedData);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load AI recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (type: 'pricing' | 'categorization' | 'competitive') => {
    try {
      setProcessingRecommendation(type);
      let functionName = '';
      
      switch (type) {
        case 'pricing':
          functionName = 'ai-pricing-optimizer';
          break;
        case 'categorization':
          functionName = 'ai-product-categorizer';
          break;
        case 'competitive':
          functionName = 'ai-competitive-analyzer';
          break;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { productId }
      });

      if (error) throw error;

      toast({
        title: "AI Analysis Complete",
        description: `Generated new ${type} recommendations`,
      });

      fetchRecommendations();
    } catch (error) {
      console.error(`Error generating ${type} recommendations:`, error);
      toast({
        title: "Analysis Failed",
        description: `Failed to generate ${type} recommendations`,
        variant: "destructive"
      });
    } finally {
      setProcessingRecommendation(null);
    }
  };

  const markAsRead = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', recommendationId);

      if (error) throw error;

      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId ? { ...rec, is_read: true } : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as read:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'pricing':
        return <DollarSign className="h-4 w-4" />;
      case 'categorization':
        return <Target className="h-4 w-4" />;
      case 'competitive':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 border-red-200 bg-red-50';
      case 'high':
        return 'text-orange-500 border-orange-200 bg-orange-50';
      case 'medium':
        return 'text-yellow-500 border-yellow-200 bg-yellow-50';
      default:
        return 'text-blue-500 border-blue-200 bg-blue-50';
    }
  };

  const getImpactBadge = (impact: string) => {
    const variant = impact === 'high' ? 'default' : impact === 'medium' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{impact} impact</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = recommendations.filter(r => !r.is_read).length;
  const pricingRecs = recommendations.filter(r => r.type === 'pricing');
  const categorizationRecs = recommendations.filter(r => r.type === 'categorization');
  const competitiveRecs = recommendations.filter(r => r.type === 'competitive');
  const generalRecs = recommendations.filter(r => r.type === 'general');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateRecommendations('pricing')}
              disabled={processingRecommendation === 'pricing'}
            >
              {processingRecommendation === 'pricing' ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
              ) : (
                <DollarSign className="h-3 w-3 mr-2" />
              )}
              Pricing
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateRecommendations('categorization')}
              disabled={processingRecommendation === 'categorization'}
            >
              {processingRecommendation === 'categorization' ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
              ) : (
                <Target className="h-3 w-3 mr-2" />
              )}
              Categories
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateRecommendations('competitive')}
              disabled={processingRecommendation === 'competitive'}
            >
              {processingRecommendation === 'competitive' ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
              ) : (
                <BarChart3 className="h-3 w-3 mr-2" />
              )}
              Competitive
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered insights to optimize your product performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="pricing">Pricing ({pricingRecs.length})</TabsTrigger>
            <TabsTrigger value="categorization">Categories ({categorizationRecs.length})</TabsTrigger>
            <TabsTrigger value="competitive">Competitive ({competitiveRecs.length})</TabsTrigger>
            {showGeneral && <TabsTrigger value="general">General ({generalRecs.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered insights by clicking the analysis buttons above
                </p>
              </div>
            ) : (
              recommendations.map((recommendation) => (
                <Card 
                  key={recommendation.id} 
                  className={`${!recommendation.is_read ? 'border-l-4 border-l-primary' : ''} ${getPriorityColor(recommendation.priority)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(recommendation.type)}
                        <CardTitle className="text-base">{recommendation.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(recommendation.impact)}
                        <Badge variant="outline">
                          {Math.round(recommendation.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{recommendation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Confidence Score</h4>
                        <Progress value={recommendation.confidence_score * 100} className="h-2" />
                      </div>
                      
                      {recommendation.action_items.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Action Items</h4>
                          <ul className="text-sm space-y-1">
                            {recommendation.action_items.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(recommendation.created_at).toLocaleDateString()}
                        </span>
                        {!recommendation.is_read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => markAsRead(recommendation.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <RecommendationTypeView recommendations={pricingRecs} onMarkAsRead={markAsRead} />
          </TabsContent>

          <TabsContent value="categorization">
            <RecommendationTypeView recommendations={categorizationRecs} onMarkAsRead={markAsRead} />
          </TabsContent>

          <TabsContent value="competitive">
            <RecommendationTypeView recommendations={competitiveRecs} onMarkAsRead={markAsRead} />
          </TabsContent>

          {showGeneral && (
            <TabsContent value="general">
              <RecommendationTypeView recommendations={generalRecs} onMarkAsRead={markAsRead} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const RecommendationTypeView = ({ 
  recommendations, 
  onMarkAsRead 
}: { 
  recommendations: AIRecommendation[], 
  onMarkAsRead: (id: string) => void 
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No recommendations of this type yet</h3>
        <p className="text-muted-foreground">
          Generate new insights using the analysis buttons above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id} className={!recommendation.is_read ? 'border-l-4 border-l-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <Badge variant="outline">
                {Math.round(recommendation.confidence_score * 100)}% confidence
              </Badge>
            </div>
            <CardDescription>{recommendation.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recommendation.action_items.length > 0 && (
              <div className="space-y-2">
                {recommendation.action_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 mt-3 border-t">
              <span className="text-xs text-muted-foreground">
                {new Date(recommendation.created_at).toLocaleDateString()}
              </span>
              {!recommendation.is_read && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onMarkAsRead(recommendation.id)}
                >
                  Mark as read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};