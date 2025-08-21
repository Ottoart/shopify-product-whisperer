import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Eye, 
  DollarSign, 
  Tag, 
  ImageIcon, 
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimizationRecommendation {
  id: string;
  product_id: string;
  product_title: string;
  type: 'pricing' | 'seo' | 'images' | 'description' | 'tags';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  current_value?: string;
  suggested_value?: string;
  impact_score: number;
  confidence: number;
  applied: boolean;
}

interface OptimizationCenterProps {
  onOptimizationApplied: () => void;
}

export function OptimizationCenter({ onOptimizationApplied }: OptimizationCenterProps) {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    highPriority: 0,
    avgImpact: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, generate mock recommendations
      const { data: products, error: productsError } = await supabase
        .from('synced_products')
        .select('id, title, price, seo_title, seo_description, optimization_score')
        .limit(10);

      if (productsError) throw productsError;

      const mockRecommendations: OptimizationRecommendation[] = [];

      products?.forEach((product, index) => {
        // Generate different types of recommendations
        if (index % 3 === 0) {
          mockRecommendations.push({
            id: `${product.id}-pricing`,
            product_id: product.id,
            product_title: product.title,
            type: 'pricing',
            priority: 'high',
            title: 'Price Optimization Opportunity',
            description: 'Competitive analysis suggests a 15% price increase could boost revenue without affecting demand.',
            current_value: `$${product.price}`,
            suggested_value: `$${(product.price * 1.15).toFixed(2)}`,
            impact_score: 85,
            confidence: 78,
            applied: false
          });
        }

        if (index % 4 === 0) {
          mockRecommendations.push({
            id: `${product.id}-seo`,
            product_id: product.id,
            product_title: product.title,
            type: 'seo',
            priority: 'medium',
            title: 'SEO Title Enhancement',
            description: 'Add high-volume keywords to improve search visibility and organic traffic.',
            current_value: product.seo_title || product.title,
            suggested_value: `${product.title} - Premium Quality | Fast Shipping`,
            impact_score: 72,
            confidence: 82,
            applied: false
          });
        }

        if (index % 5 === 0) {
          mockRecommendations.push({
            id: `${product.id}-images`,
            product_id: product.id,
            product_title: product.title,
            type: 'images',
            priority: 'low',
            title: 'Image Quality Improvement',
            description: 'Add lifestyle images and improve product photography for better conversion.',
            impact_score: 60,
            confidence: 65,
            applied: false
          });
        }
      });

      setRecommendations(mockRecommendations);

      // Calculate stats
      const total = mockRecommendations.length;
      const applied = mockRecommendations.filter(r => r.applied).length;
      const highPriority = mockRecommendations.filter(r => r.priority === 'high').length;
      const avgImpact = total > 0 
        ? mockRecommendations.reduce((sum, r) => sum + r.impact_score, 0) / total 
        : 0;

      setStats({ total, applied, highPriority, avgImpact });

    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (recommendationId: string) => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return;

      // Simulate applying the recommendation
      setRecommendations(prev => 
        prev.map(r => r.id === recommendationId ? { ...r, applied: true } : r)
      );

      toast({
        title: "Recommendation Applied",
        description: `${recommendation.title} has been applied successfully`
      });

      // Update stats
      setStats(prev => ({ ...prev, applied: prev.applied + 1 }));
      onOptimizationApplied();

    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to apply recommendation",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing':
        return <DollarSign className="h-4 w-4" />;
      case 'seo':
        return <Search className="h-4 w-4" />;
      case 'images':
        return <ImageIcon className="h-4 w-4" />;
      case 'description':
        return <Eye className="h-4 w-4" />;
      case 'tags':
        return <Tag className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filterRecommendations = () => {
    if (activeTab === 'all') return recommendations;
    if (activeTab === 'pending') return recommendations.filter(r => !r.applied);
    if (activeTab === 'applied') return recommendations.filter(r => r.applied);
    return recommendations.filter(r => r.type === activeTab);
  };

  if (loading) {
    return (
      <Card className="prep-fox-card">
        <CardHeader>
          <div className="h-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="prep-fox-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.applied}</div>
            <Progress 
              value={stats.total > 0 ? (stats.applied / stats.total) * 100 : 0} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{Math.round(stats.avgImpact)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="prep-fox-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Smart suggestions to improve your product performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filterRecommendations().length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No recommendations found
                    </h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? 'Sync products to generate AI recommendations'
                        : `No ${activeTab} recommendations available`
                      }
                    </p>
                  </div>
                ) : (
                  filterRecommendations().map((recommendation) => (
                    <Card key={recommendation.id} className="prep-fox-card">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {getTypeIcon(recommendation.type)}
                              <h3 className="font-semibold text-foreground">
                                {recommendation.title}
                              </h3>
                              {getPriorityBadge(recommendation.priority)}
                              {recommendation.applied && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              <span className="font-medium">Product:</span> {recommendation.product_title}
                            </p>
                            
                            <p className="text-sm text-foreground mb-4">
                              {recommendation.description}
                            </p>

                            {recommendation.current_value && recommendation.suggested_value && (
                              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                                <div>
                                  <span className="text-xs text-muted-foreground">Current:</span>
                                  <p className="text-sm font-medium">{recommendation.current_value}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Suggested:</span>
                                  <p className="text-sm font-medium text-primary">{recommendation.suggested_value}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Impact:</span>
                                <span className={`text-sm font-medium ${getImpactColor(recommendation.impact_score)}`}>
                                  {recommendation.impact_score}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Confidence:</span>
                                <span className="text-sm font-medium">{recommendation.confidence}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {!recommendation.applied ? (
                              <Button
                                onClick={() => applyRecommendation(recommendation.id)}
                                className="prep-fox-button"
                                size="sm"
                              >
                                Apply
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}