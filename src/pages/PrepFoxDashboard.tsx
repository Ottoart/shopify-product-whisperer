import { useState, useMemo } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { useShopifyAnalytics } from '@/hooks/useShopifyAnalytics';
import { StoreConfig } from '@/components/StoreConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Tag, 
  Copy, 
  Image,
  FileText,
  ShoppingCart,
  Warehouse,
  Target,
  BarChart3,
  Home,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

const PrepFoxDashboard = () => {
  const { session } = useSessionContext();
  const { analytics, isLoading, refreshNow, isRefreshing, hasCredentials, lastUpdated } = useShopifyAnalytics();
  const [activeTab, setActiveTab] = useState('cleanup');
  const [storeUrl, setStoreUrl] = useState(() => localStorage.getItem('shopify_domain') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('shopify_access_token') || '');

  // Chart data for visualizations - moved before early returns to avoid hook order issues
  const chartData = useMemo(() => {
    if (!analytics) return null;
    
    return {
      salesByCategory: analytics.categoryAnalysis.productTypes.slice(0, 8).map(item => ({
        name: item.type || 'Uncategorized',
        sales: analytics.topSellers.filter(seller => 
          seller.product?.product_type?.toLowerCase() === item.type
        ).reduce((sum, seller) => sum + seller.revenue, 0),
        products: item.count,
      })),
      inventoryDistribution: [
        { name: 'Well Stocked', value: analytics.wellStocked.length, color: 'hsl(var(--success))' },
        { name: 'Low Stock', value: analytics.lowStock.length, color: 'hsl(var(--warning))' },
        { name: 'Out of Stock', value: analytics.outOfStock.length, color: 'hsl(var(--destructive))' },
      ],
      duplicateHeatmap: [
        { type: 'Same Title', count: analytics.duplicates.filter(d => d.type === 'Same Title').length },
        { type: 'Same Image', count: analytics.duplicates.filter(d => d.type === 'Same Image').length },
        { type: 'Same SKU', count: analytics.duplicates.filter(d => d.type === 'Same SKU').length },
      ],
      salesTrend: analytics.topSellers.slice(0, 10).map((seller, index) => ({
        name: seller.product?.title?.substring(0, 20) + '...' || `Product ${index + 1}`,
        sales: seller.sales,
        revenue: seller.revenue,
      })),
    };
  }, [analytics]);

  if (!session) {
    return <Auth />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Show setup message if no credentials
  if (!hasCredentials) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-gradient-primary">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary-foreground">
                <BarChart3 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                  <p className="text-primary-foreground/80">Advanced product analytics and optimization insights</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <StoreConfig
            storeUrl={storeUrl}
            onStoreUrlChange={setStoreUrl}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        </div>
      </div>
    );
  }

  // Show no data message if no analytics available
  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-gradient-primary">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary-foreground">
                <BarChart3 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                  <p className="text-primary-foreground/80">Advanced product analytics and optimization insights</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={refreshNow}
                  disabled={isRefreshing}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Loading...' : 'Load Data'}
                </Button>
                <Link to="/">
                  <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No analytics data available yet. Click "Load Data" to fetch your Shopify store analytics for the first time.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const products = analytics.products || [];
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary-foreground">
              <BarChart3 className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                <p className="text-primary-foreground/80">Advanced product analytics and optimization insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                {lastUpdated && (
                  <p className="text-primary-foreground/80 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
              <Button 
                onClick={refreshNow}
                disabled={isRefreshing}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </Button>
              <Link to="/">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duplicates Found</p>
                  <p className="text-3xl font-bold text-warning">{analytics.duplicates.length}</p>
                </div>
                <Copy className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Content Issues</p>
                  <p className="text-3xl font-bold text-destructive">
                    {analytics.missingMetaTitles.length + analytics.missingMetaDescriptions.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue (90d)</p>
                  <p className="text-3xl font-bold text-success">
                    ${analytics.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Product Cleanup Tab */}
          <TabsContent value="cleanup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-warning" />
                    Duplicate Products ({analytics.duplicates.length})
                  </CardTitle>
                  <CardDescription>Products with matching titles, images, or SKUs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.duplicates.slice(0, 5).map((duplicate, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={duplicate.type === 'Same Title' ? 'destructive' : 'secondary'}>
                          {duplicate.type} - {duplicate.similarity}% match
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {duplicate.products.length} products
                        </span>
                      </div>
                      <div className="space-y-1">
                        {duplicate.products.map(product => (
                          <p key={product.id} className="text-sm truncate">
                            {product.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {analytics.duplicates.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No duplicates detected</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Product Issues
                  </CardTitle>
                  <CardDescription>Products requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unpublished Products</span>
                      <Badge variant="outline">{analytics.unpublished.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Images</span>
                      <Badge variant="outline">{analytics.missingImages.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Descriptions</span>
                      <Badge variant="outline">{analytics.missingDescriptions.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">No Vendor Assigned</span>
                      <Badge variant="outline">{analytics.vendorAnalysis.noVendor.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Optimization Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    SEO Optimization
                  </CardTitle>
                  <CardDescription>Products missing SEO elements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Missing Meta Titles</span>
                        <span className="text-sm font-medium">{analytics.missingMetaTitles.length}</span>
                      </div>
                      <Progress 
                        value={(analytics.missingMetaTitles.length / totalProducts) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Missing Meta Descriptions</span>
                        <span className="text-sm font-medium">{analytics.missingMetaDescriptions.length}</span>
                      </div>
                      <Progress 
                        value={(analytics.missingMetaDescriptions.length / totalProducts) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-secondary" />
                    Content Quality
                  </CardTitle>
                  <CardDescription>Description length analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Short Descriptions (&lt;100 words)</span>
                      <Badge variant="outline">{analytics.shortDescriptions.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Long Descriptions (&gt;500 words)</span>
                      <Badge variant="outline">{analytics.longDescriptions.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Alt Tags</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Performance Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Top 10 bestsellers by revenue (90 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topSellers.slice(0, 10).map((seller, index) => (
                      <div key={seller.productId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm truncate max-w-[200px]">{seller.product?.title || 'Unknown Product'}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${seller.revenue.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{seller.sales} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    Performance Issues
                  </CardTitle>
                  <CardDescription>Products needing attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zero Sales (90 days)</span>
                      <Badge variant="destructive">{analytics.zeroSales.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Orders</span>
                      <Badge variant="outline">{analytics.totalOrders}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unpublished Products</span>
                      <Badge variant="secondary">
                        {analytics.unpublished.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Intelligence Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-warning" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription>{analytics.lowStock.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analytics.lowStock.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[150px]">{product.title}</span>
                      <Badge variant="secondary">{product.inventoryQuantity} left</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Out of Stock
                  </CardTitle>
                  <CardDescription>{analytics.outOfStock.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analytics.outOfStock.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[150px]">{product.title}</span>
                      <Badge variant="destructive">0 stock</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-success" />
                    Well Stocked
                  </CardTitle>
                  <CardDescription>{analytics.wellStocked.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {analytics.wellStocked.length} products have healthy inventory levels
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tags & Categories Tab */}
          <TabsContent value="tags" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Popular Tags
                  </CardTitle>
                  <CardDescription>Most used product tags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.tagAnalysis.popularTags.map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{tag.tag}</span>
                      <Badge variant="outline">{tag.count} products</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-secondary" />
                    Category Distribution
                  </CardTitle>
                  <CardDescription>Product types breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.categoryAnalysis.productTypes.slice(0, 8).map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{type.type || 'Uncategorized'}</span>
                      <Badge variant="outline">{type.count} products</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Tag Consistency Issues</CardTitle>
                  <CardDescription>Products requiring tag optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Untagged Products</span>
                    <Badge variant="destructive">{analytics.tagAnalysis.untagged.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">No Category Assigned</span>
                    <Badge variant="secondary">{analytics.categoryAnalysis.uncategorized.length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Top Vendors</CardTitle>
                  <CardDescription>Most represented vendors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.vendorAnalysis.vendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{vendor.vendor || 'Unknown'}</span>
                      <Badge variant="outline">{vendor.count} products</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Real revenue performance by product type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.salesByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Inventory Distribution</CardTitle>
                  <CardDescription>Stock level breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {chartData.inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Duplicate Detection</CardTitle>
                  <CardDescription>Types of duplicates found</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.duplicateHeatmap}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--warning))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Top Product Sales</CardTitle>
                  <CardDescription>Revenue performance of bestselling products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrepFoxDashboard;