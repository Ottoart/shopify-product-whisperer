import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Target, 
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MockDataBadge, LiveDataBadge } from '@/components/ui/mock-data-badge';

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  priority: string;
  action_items: string[];
  created_at: string;
  is_read: boolean;
}

interface Metrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  conversion_rate: number;
  profit_margin: number;
  cost_savings: number;
  products_optimized: number;
  price_changes: number;
}

interface PerformanceData {
  metric_date: string;
  total_revenue: number;
  total_orders: number;
  cost_savings: number;
}

export function EnhancedDashboard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [insightsResult, metricsResult] = await Promise.all([
        supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('performance_metrics')
          .select('*')
          .order('metric_date', { ascending: false })
          .limit(30)
      ]);

      // Set insights data or use mock data if empty
      if (insightsResult.data && insightsResult.data.length > 0) {
        setInsights(insightsResult.data);
      } else {
        // Mock insights data for demo
        setInsights([
          {
            id: '1',
            insight_type: 'pricing',
            title: 'Optimize pricing for top 10 products',
            description: 'AI analysis shows you can increase margins by 12% by adjusting prices on your best sellers.',
            confidence_score: 0.85,
            priority: 'high',
            action_items: ['Review pricing on Product A', 'Update Product B price to $24.99', 'Monitor competitor pricing'],
            created_at: new Date().toISOString(),
            is_read: false
          },
          {
            id: '2',
            insight_type: 'inventory',
            title: 'Low stock alert on trending items',
            description: 'Several trending products are running low on inventory. Restock to avoid lost sales.',
            confidence_score: 0.92,
            priority: 'critical',
            action_items: ['Reorder Widget X (5 units remaining)', 'Increase safety stock for seasonal items'],
            created_at: new Date().toISOString(),
            is_read: false
          }
        ]);
      }

      // Set metrics data or use mock data if empty
      if (metricsResult.data && metricsResult.data.length > 0) {
        setPerformanceData(metricsResult.data);
        setMetrics(metricsResult.data[0]);
      } else {
        // Mock metrics data for demo
        const mockMetrics = {
          total_revenue: 12547.89,
          total_orders: 45,
          avg_order_value: 278.84,
          conversion_rate: 3.2,
          profit_margin: 28.5,
          cost_savings: 1245.67,
          products_optimized: 23,
          price_changes: 8
        };
        setMetrics(mockMetrics);

        // Mock performance data for charts
        const mockPerformanceData = Array.from({ length: 7 }, (_, i) => ({
          metric_date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
          total_revenue: Math.random() * 5000 + 8000,
          total_orders: Math.floor(Math.random() * 20) + 30,
          cost_savings: Math.random() * 500 + 200
        }));
        setPerformanceData(mockPerformanceData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { force_refresh: true }
      });

      if (error) throw error;

      toast({
        title: "AI Insights Generated",
        description: `Generated ${data.generated || 0} new insights for your business.`,
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const updatePerformanceMetrics = async () => {
    try {
      const { error } = await supabase.functions.invoke('update-performance-metrics');
      if (error) throw error;
      
      toast({
        title: "Metrics Updated",
        description: "Performance metrics have been refreshed.",
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const markInsightAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId);
      
      setInsights(insights.map(insight => 
        insight.id === insightId ? { ...insight, is_read: true } : insight
      ));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'inventory': return <ShoppingCart className="h-4 w-4" />;
      case 'trends': return <TrendingUp className="h-4 w-4" />;
      case 'marketing': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const chartData = performanceData.slice(0, 7).reverse().map(data => ({
    date: new Date(data.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: data.total_revenue,
    orders: data.total_orders,
    savings: data.cost_savings
  }));

  const unreadInsights = insights.filter(i => !i.is_read);
  const criticalInsights = insights.filter(i => i.priority === 'critical');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground">AI-powered insights for your e-commerce business</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={updatePerformanceMetrics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={generateAIInsights}
            disabled={generatingInsights}
            className="gap-2"
          >
            {generatingInsights ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate AI Insights
          </Button>
        </div>
      </div>

      {/* Alert Section */}
      {criticalInsights.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts ({criticalInsights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalInsights.slice(0, 2).map((insight) => (
                <div key={insight.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <span className="text-sm">{insight.title}</span>
                  <Button size="sm" variant="outline" onClick={() => markInsightAsRead(insight.id)}>
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MockDataBadge>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.total_revenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total_orders} orders • ${metrics.avg_order_value.toFixed(2)} AOV
                </p>
              </CardContent>
            </Card>
          </MockDataBadge>

          <MockDataBadge>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${metrics.cost_savings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.products_optimized} products optimized
                </p>
              </CardContent>
            </Card>
          </MockDataBadge>

          <MockDataBadge>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.conversion_rate.toFixed(1)}%</div>
                <Progress value={metrics.conversion_rate} className="mt-2" />
              </CardContent>
            </Card>
          </MockDataBadge>

          <MockDataBadge>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.profit_margin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.price_changes} price changes today
                </p>
              </CardContent>
            </Card>
          </MockDataBadge>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="relative">
            AI Insights
            {unreadInsights.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadInsights.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.slice(0, 6).map((insight) => (
              <Card key={insight.id} className={`${!insight.is_read ? 'border-primary shadow-md' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.insight_type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      {!insight.is_read && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{insight.description}</p>
                  {insight.action_items.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Recommended Actions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {insight.action_items.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                      <span>•</span>
                      <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                    {!insight.is_read && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markInsightAsRead(insight.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 7 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders & Savings</CardTitle>
                <CardDescription>Daily performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                    <Bar dataKey="savings" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Business Health Score</CardTitle>
                <CardDescription>Overall performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-24" />
                      <span className="text-sm text-green-600">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inventory Health</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-24" />
                      <span className="text-sm text-yellow-600">Moderate</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pricing Optimization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-24" />
                      <span className="text-sm text-green-600">Excellent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Insights</span>
                  <Badge>{unreadInsights.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Products</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store Health</span>
                  <Badge variant="default">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}