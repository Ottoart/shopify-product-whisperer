import { useState, useEffect } from 'react';
import { useTabPersistence } from "@/hooks/useTabPersistence";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Package, DollarSign, Star, AlertTriangle, Target, Zap, Brain, BarChart3 } from 'lucide-react';
// import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

interface ProductInsight {
  category: string;
  count: number;
  avgPrice: number;
  revenue: number;
  performance: 'high' | 'medium' | 'low';
}

interface AIRecommendation {
  type: 'pricing' | 'seo' | 'inventory' | 'content';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  products: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export const ProductAnalytics = () => {
  const products: any[] = [];
  const isLoading = false;
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useTabPersistence('product-analytics', 'insights');

  useEffect(() => {
    if (products.length > 0) {
      analyzeProducts();
    }
  }, [products]);

  const analyzeProducts = () => {
    setIsAnalyzing(true);
    
    try {
      // Analyze by category/type
      const categoryStats = products.reduce((acc, product) => {
        const category = product.type || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalPrice: 0,
            prices: []
          };
        }
        acc[category].count++;
        const price = product.variantPrice || 0;
        acc[category].totalPrice += price;
        acc[category].prices.push(price);
        return acc;
      }, {} as Record<string, any>);

      const categoryInsights: ProductInsight[] = Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
        category,
        count: stats.count,
        avgPrice: stats.totalPrice / stats.count,
        revenue: stats.totalPrice * stats.count * 0.1, // Estimate
        performance: stats.count > 50 ? 'high' : stats.count > 20 ? 'medium' : 'low'
      }));

      setInsights(categoryInsights.sort((a, b) => b.count - a.count).slice(0, 8));

      // Generate AI recommendations
      const aiRecommendations = generateRecommendations(products, categoryInsights);
      setRecommendations(aiRecommendations);

    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (products: any[], insights: ProductInsight[]): AIRecommendation[] => {
    const recs: AIRecommendation[] = [];

    // SEO recommendations
    const productsWithoutSEO = products.filter(p => !p.seoTitle || !p.seoDescription);
    if (productsWithoutSEO.length > 0) {
      recs.push({
        type: 'seo',
        title: 'Optimize SEO for Better Visibility',
        description: `${productsWithoutSEO.length} products are missing SEO titles or descriptions, which could impact search rankings.`,
        impact: 'high',
        action: 'Add SEO titles and meta descriptions',
        products: productsWithoutSEO.length
      });
    }

    // Pricing recommendations
    const productsWithoutPricing = products.filter(p => !p.variantPrice || p.variantPrice === 0);
    if (productsWithoutPricing.length > 0) {
      recs.push({
        type: 'pricing',
        title: 'Set Competitive Pricing',
        description: `${productsWithoutPricing.length} products need pricing information to start generating revenue.`,
        impact: 'high',
        action: 'Add pricing to products',
        products: productsWithoutPricing.length
      });
    }

    // Content recommendations
    const productsWithShortDescriptions = products.filter(p => !p.bodyHtml || p.bodyHtml.length < 100);
    if (productsWithShortDescriptions.length > 0) {
      recs.push({
        type: 'content',
        title: 'Enhance Product Descriptions',
        description: `${productsWithShortDescriptions.length} products have minimal descriptions. Rich content improves conversions.`,
        impact: 'medium',
        action: 'Write detailed product descriptions',
        products: productsWithShortDescriptions.length
      });
    }

    // Inventory recommendations
    const lowStockProducts = products.filter(p => p.variantInventoryQty && p.variantInventoryQty < 10);
    if (lowStockProducts.length > 0) {
      recs.push({
        type: 'inventory',
        title: 'Monitor Low Stock Items',
        description: `${lowStockProducts.length} products are running low on inventory and may need restocking soon.`,
        impact: 'medium',
        action: 'Review and restock inventory',
        products: lowStockProducts.length
      });
    }

    return recs.slice(0, 6);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'seo': return <Target className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'content': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <BarChart3 className="h-6 w-6 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold">
                  ${(products.reduce((sum, p) => sum + (p.variantPrice || 0), 0) / products.length || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Product Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Product distribution and performance by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={insights}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Product Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insights}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {insights.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Price Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={insights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgPrice" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Smart insights to optimize your product catalog and boost performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="space-y-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getImpactColor(rec.impact)}>
                              {rec.impact} impact
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rec.products} products affected
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};