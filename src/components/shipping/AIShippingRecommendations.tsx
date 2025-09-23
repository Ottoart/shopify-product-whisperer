import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, TrendingUp, Target, Lightbulb, DollarSign, Clock, Truck, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIInsight {
  id: string;
  title: string;
  description: string;
  action_items: string[];
  data_points: any;
  confidence_score: number;
  priority: string;
  created_at: string;
  is_read: boolean;
}

export function AIShippingRecommendations() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizationType, setOptimizationType] = useState("cost_reduction");
  const [ruleType, setRuleType] = useState("cost_optimization");
  const [businessRequirements, setBusinessRequirements] = useState("");

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('insight_type', 'shipping_optimization')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to fetch AI insights');
    }
  };

  const generateOptimizationRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-shipping-optimizer', {
        body: { optimization_type: optimizationType }
      });

      if (error) throw error;

      toast.success('AI optimization recommendations generated!');
      await fetchInsights();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateShippingRules = async () => {
    if (!businessRequirements.trim()) {
      toast.error('Please provide business requirements');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-shipping-rules-generator', {
        body: { 
          rule_type: ruleType,
          business_requirements: businessRequirements
        }
      });

      if (error) throw error;

      toast.success(`Generated ${data.generated_rules?.length || 0} shipping rules!`);
      await fetchInsights();
    } catch (error) {
      console.error('Error generating rules:', error);
      toast.error('Failed to generate shipping rules');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId);
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId ? { ...insight, is_read: true } : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Target;
      case 'low': return CheckCircle;
      default: return Lightbulb;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold">AI Shipping Intelligence</h2>
          <p className="text-muted-foreground">
            AI-powered optimization and automation for your shipping operations
          </p>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="automation">Rule Generation</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generate Optimization Recommendations
              </CardTitle>
              <CardDescription>
                AI analyzes your shipping data to identify cost-saving opportunities and efficiency improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optimization-type">Optimization Focus</Label>
                <Select value={optimizationType} onValueChange={setOptimizationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select optimization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                    <SelectItem value="delivery_speed">Delivery Speed</SelectItem>
                    <SelectItem value="carrier_optimization">Carrier Optimization</SelectItem>
                    <SelectItem value="packaging_efficiency">Packaging Efficiency</SelectItem>
                    <SelectItem value="route_optimization">Route Optimization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateOptimizationRecommendations}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Shipping Rules Generator
              </CardTitle>
              <CardDescription>
                Automatically generate intelligent shipping rules based on your business requirements and historical data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select value={ruleType} onValueChange={setRuleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost_optimization">Cost Optimization</SelectItem>
                    <SelectItem value="carrier_selection">Carrier Selection</SelectItem>
                    <SelectItem value="service_level">Service Level</SelectItem>
                    <SelectItem value="regional_routing">Regional Routing</SelectItem>
                    <SelectItem value="weight_based">Weight-Based Rules</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Business Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe your shipping goals, constraints, and priorities..."
                  value={businessRequirements}
                  onChange={(e) => setBusinessRequirements(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={generateShippingRules}
                disabled={loading || !businessRequirements.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Generating Rules...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate AI Rules
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent AI Insights</h3>
            <Button onClick={fetchInsights} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {insights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No AI insights available yet. Generate some recommendations to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {insights.map((insight) => {
                const PriorityIcon = getPriorityIcon(insight.priority);
                return (
                  <Card key={insight.id} className={`${!insight.is_read ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <PriorityIcon className="h-5 w-5" />
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant={getPriorityColor(insight.priority) as any}>
                            {insight.priority}
                          </Badge>
                          {!insight.is_read && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-4 w-4" />
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </div>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {insight.confidence_score && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence Score</span>
                            <span>{Math.round(insight.confidence_score * 100)}%</span>
                          </div>
                          <Progress value={insight.confidence_score * 100} />
                        </div>
                      )}

                      {insight.data_points?.potential_savings && (
                        <Card className="p-4 bg-green-50 border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">Potential Savings</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {insight.data_points.potential_savings.monthly && (
                              <div>
                                <span className="text-green-700">Monthly:</span>
                                <div className="font-semibold text-green-900">
                                  {formatCurrency(insight.data_points.potential_savings.monthly)}
                                </div>
                              </div>
                            )}
                            {insight.data_points.potential_savings.yearly && (
                              <div>
                                <span className="text-green-700">Yearly:</span>
                                <div className="font-semibold text-green-900">
                                  {formatCurrency(insight.data_points.potential_savings.yearly)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {insight.action_items?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Action Items
                          </h4>
                          <ul className="space-y-1">
                            {insight.action_items.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                        {!insight.is_read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsRead(insight.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}