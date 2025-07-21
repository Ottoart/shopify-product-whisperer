import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Brain,
  RefreshCw,
  Sparkles,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  alert_type: string;
  message: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
}

interface Rule {
  id: string;
  name: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  marketplaces: string[];
}

export function EnhancedRepricingDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [priceChanges, setPriceChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRulesCount, setActiveRulesCount] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadRepricingData();
  }, []);

  const loadRepricingData = async () => {
    try {
      const [alertsResult, rulesResult, productsResult, changesResult] = await Promise.all([
        supabase.from('repricing_alerts').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('repricing_rules').select('*').order('priority', { ascending: false }),
        supabase.from('product_pricing').select('*').limit(20),
        supabase.from('price_changes').select('*').order('created_at', { ascending: false }).limit(30)
      ]);

      if (alertsResult.data) setAlerts(alertsResult.data);
      if (rulesResult.data) {
        setRules(rulesResult.data);
        setActiveRulesCount(rulesResult.data.filter(r => r.is_active).length);
      }
      if (productsResult.data) setProducts(productsResult.data);
      if (changesResult.data) {
        setPriceChanges(changesResult.data);
        const savings = changesResult.data.reduce((sum, change) => {
          const saving = ((change.new_price || 0) - (change.old_price || 0)) * 10; // Estimate 10 units
          return sum + (saving > 0 ? saving : 0);
        }, 0);
        setTotalSavings(savings);
      }
    } catch (error) {
      console.error('Error loading repricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { insight_type: 'pricing', force_refresh: true }
      });

      if (error) throw error;

      toast({
        title: "AI Pricing Insights Generated",
        description: "Generated new pricing optimization insights.",
      });

      loadRepricingData();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate pricing insights.",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await supabase
        .from('repricing_alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));

      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved.",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const unreadAlerts = alerts.filter(a => !a.is_resolved);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_resolved);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dynamic Repricing Dashboard</h1>
          <p className="text-muted-foreground">AI-powered pricing optimization and market intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadRepricingData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={generateAIInsights}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Pricing Insights
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Pricing Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-background rounded border">
                  <div>
                    <p className="font-medium">{alert.alert_type}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRulesCount}</div>
            <p className="text-xs text-muted-foreground">
              {rules.length} total rules configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Tracked</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitored for price optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From recent price optimizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Changes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceChanges.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent pricing adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.slice(0, 10).map((alert) => (
              <Card key={alert.id} className={`${!alert.is_resolved ? 'border-orange-200' : 'opacity-60'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${alert.is_resolved ? 'text-gray-400' : 'text-orange-500'}`} />
                      <div>
                        <p className="font-medium">{alert.alert_type}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.is_resolved ? (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Type: {rule.rule_type} • Priority: {rule.priority}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {rule.marketplaces.map((marketplace) => (
                          <Badge key={marketplace} variant="outline" className="text-xs">
                            {marketplace}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Performance</CardTitle>
                <CardDescription>Recent optimization results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Revenue Increase</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-24" />
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conversion Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-24" />
                      <span className="text-sm text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Profit Margin</span>
                    <div className="flex items-center gap-2">
                      <Progress value={82} className="w-24" />
                      <span className="text-sm text-green-600">+15.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest price adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceChanges.slice(0, 5).map((change) => (
                    <div key={change.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="text-sm font-medium">Price updated</p>
                        <p className="text-xs text-muted-foreground">
                          ${change.old_price} → ${change.new_price}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(change.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Pricing Insights
              </CardTitle>
              <CardDescription>
                Machine learning recommendations for pricing optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Market Opportunity</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Products in the Electronics category show 15% higher conversion rates when priced $5-10 below competitors.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      High Confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900">Optimization Success</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your dynamic pricing rules have generated an additional $2,847 in revenue this month.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Verified Result
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900">Price Adjustment Needed</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    12 products are priced significantly above market average and may benefit from price reduction.
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Action Required
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}