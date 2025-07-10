import { useState, useMemo } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/pages/Index';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

const PrepFoxDashboard = () => {
  const { session } = useSessionContext();
  const { products, isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState('cleanup');

  if (!session) {
    return <Auth />;
  }

  // Product Cleanup Analytics
  const duplicateAnalysis = useMemo(() => {
    const duplicates: Array<{ products: Product[]; matchType: string; similarity: number }> = [];
    
    // Find products with same title (high similarity)
    const titleGroups = products.reduce((acc, product) => {
      const key = product.title.toLowerCase().trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    Object.entries(titleGroups).forEach(([title, group]) => {
      if (group.length > 1) {
        duplicates.push({ products: group, matchType: 'Same Title', similarity: 100 });
      }
    });

    // Find products with same image
    const imageGroups = products.reduce((acc, product) => {
      if (product.imageSrc) {
        const key = product.imageSrc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(product);
      }
      return acc;
    }, {} as Record<string, Product[]>);

    Object.entries(imageGroups).forEach(([image, group]) => {
      if (group.length > 1) {
        duplicates.push({ products: group, matchType: 'Same Image', similarity: 95 });
      }
    });

    // Find products with same SKU
    const skuGroups = products.reduce((acc, product) => {
      if (product.variantSku) {
        const key = product.variantSku;
        if (!acc[key]) acc[key] = [];
        acc[key].push(product);
      }
      return acc;
    }, {} as Record<string, Product[]>);

    Object.entries(skuGroups).forEach(([sku, group]) => {
      if (group.length > 1) {
        duplicates.push({ products: group, matchType: 'Same SKU', similarity: 90 });
      }
    });

    return duplicates;
  }, [products]);

  // Content Optimization Analytics
  const contentIssues = useMemo(() => {
    const issues = {
      missingMetaTitles: products.filter(p => !p.seoTitle),
      missingMetaDescriptions: products.filter(p => !p.seoDescription),
      missingAltTags: products.filter(p => p.imageSrc && !p.imageSrc.includes('alt=')),
      shortDescriptions: products.filter(p => p.bodyHtml && p.bodyHtml.length < 100),
      longDescriptions: products.filter(p => p.bodyHtml && p.bodyHtml.length > 500),
    };
    return issues;
  }, [products]);

  // Sales Performance Simulation (since we don't have real sales data)
  const salesData = useMemo(() => {
    // Simulate sales data based on product characteristics
    const productSales = products.map(product => {
      const baseScore = product.variantPrice * 0.1;
      const publishedBonus = product.published ? 50 : 0;
      const hasImageBonus = product.imageSrc ? 25 : 0;
      const hasDescBonus = product.bodyHtml ? 15 : 0;
      
      return {
        ...product,
        revenue: Math.floor((baseScore + publishedBonus + hasImageBonus + hasDescBonus) * Math.random() * 10),
        units: Math.floor(Math.random() * 100),
      };
    });

    return {
      topSellers: productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      zeroSales: productSales.filter(p => p.units === 0),
      declining: productSales.filter(p => p.revenue < 50).slice(0, 10),
    };
  }, [products]);

  // Inventory Analytics
  const inventoryData = useMemo(() => {
    return {
      lowStock: products.filter(p => p.variantInventoryQty > 0 && p.variantInventoryQty < 10),
      outOfStock: products.filter(p => p.variantInventoryQty === 0),
      wellStocked: products.filter(p => p.variantInventoryQty >= 10),
    };
  }, [products]);

  // Tag and Category Consistency
  const tagAnalysis = useMemo(() => {
    const tagMap = new Map<string, Product[]>();
    const typeMap = new Map<string, Product[]>();
    const vendorMap = new Map<string, Product[]>();

    products.forEach(product => {
      // Analyze tags
      if (product.tags) {
        const tags = product.tags.split(',').map(t => t.trim().toLowerCase());
        tags.forEach(tag => {
          if (!tagMap.has(tag)) tagMap.set(tag, []);
          tagMap.get(tag)!.push(product);
        });
      }

      // Analyze types
      if (product.type) {
        const type = product.type.toLowerCase();
        if (!typeMap.has(type)) typeMap.set(type, []);
        typeMap.get(type)!.push(product);
      }

      // Analyze vendors
      if (product.vendor) {
        const vendor = product.vendor.toLowerCase();
        if (!vendorMap.has(vendor)) vendorMap.set(vendor, []);
        vendorMap.get(vendor)!.push(product);
      }
    });

    return {
      popularTags: Array.from(tagMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 10)
        .map(([tag, products]) => ({ tag, count: products.length })),
      productTypes: Array.from(typeMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .map(([type, products]) => ({ type, count: products.length })),
      vendors: Array.from(vendorMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 10)
        .map(([vendor, products]) => ({ vendor, count: products.length })),
      untagged: products.filter(p => !p.tags || p.tags.trim() === ''),
      noCategory: products.filter(p => !p.category),
    };
  }, [products]);

  // Chart data for visualizations
  const chartData = useMemo(() => {
    return {
      salesByCategory: tagAnalysis.productTypes.slice(0, 8).map(item => ({
        name: item.type || 'Uncategorized',
        sales: Math.floor(Math.random() * 1000) + 100,
        products: item.count,
      })),
      inventoryDistribution: [
        { name: 'Well Stocked', value: inventoryData.wellStocked.length, color: 'hsl(var(--success))' },
        { name: 'Low Stock', value: inventoryData.lowStock.length, color: 'hsl(var(--warning))' },
        { name: 'Out of Stock', value: inventoryData.outOfStock.length, color: 'hsl(var(--destructive))' },
      ],
      duplicateHeatmap: [
        { type: 'Same Title', count: duplicateAnalysis.filter(d => d.matchType === 'Same Title').length },
        { type: 'Same Image', count: duplicateAnalysis.filter(d => d.matchType === 'Same Image').length },
        { type: 'Same SKU', count: duplicateAnalysis.filter(d => d.matchType === 'Same SKU').length },
      ],
    };
  }, [duplicateAnalysis, inventoryData, tagAnalysis]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
            <Link to="/">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Home className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
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
                  <p className="text-3xl font-bold">{products.length}</p>
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
                  <p className="text-3xl font-bold text-warning">{duplicateAnalysis.length}</p>
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
                    {contentIssues.missingMetaTitles.length + contentIssues.missingMetaDescriptions.length}
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
                  <p className="text-sm text-muted-foreground">Published Rate</p>
                  <p className="text-3xl font-bold text-success">
                    {Math.round((products.filter(p => p.published).length / products.length) * 100)}%
                  </p>
                </div>
                <Eye className="h-8 w-8 text-success" />
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
                    Duplicate Products ({duplicateAnalysis.length})
                  </CardTitle>
                  <CardDescription>Products with matching titles, images, or SKUs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {duplicateAnalysis.slice(0, 5).map((duplicate, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={duplicate.matchType === 'Same Title' ? 'destructive' : 'secondary'}>
                          {duplicate.matchType} - {duplicate.similarity}% match
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
                  {duplicateAnalysis.length === 0 && (
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
                      <Badge variant="outline">{products.filter(p => !p.published).length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Images</span>
                      <Badge variant="outline">{products.filter(p => !p.imageSrc).length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Descriptions</span>
                      <Badge variant="outline">{products.filter(p => !p.bodyHtml).length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">No Vendor Assigned</span>
                      <Badge variant="outline">{products.filter(p => !p.vendor).length}</Badge>
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
                        <span className="text-sm font-medium">{contentIssues.missingMetaTitles.length}</span>
                      </div>
                      <Progress 
                        value={(contentIssues.missingMetaTitles.length / products.length) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Missing Meta Descriptions</span>
                        <span className="text-sm font-medium">{contentIssues.missingMetaDescriptions.length}</span>
                      </div>
                      <Progress 
                        value={(contentIssues.missingMetaDescriptions.length / products.length) * 100} 
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
                      <Badge variant="outline">{contentIssues.shortDescriptions.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Long Descriptions (&gt;500 words)</span>
                      <Badge variant="outline">{contentIssues.longDescriptions.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missing Alt Tags</span>
                      <Badge variant="outline">{contentIssues.missingAltTags.length}</Badge>
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
                  <CardDescription>Simulated top 10 bestsellers by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesData.topSellers.slice(0, 10).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm truncate max-w-[200px]">{product.title}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${product.revenue}</p>
                          <p className="text-xs text-muted-foreground">{product.units} units</p>
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
                      <Badge variant="destructive">{salesData.zeroSales.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Declining Trend</span>
                      <Badge variant="outline">{salesData.declining.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Below Average Performance</span>
                      <Badge variant="secondary">
                        {products.filter(p => !p.published || !p.imageSrc).length}
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
                  <CardDescription>{inventoryData.lowStock.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {inventoryData.lowStock.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[150px]">{product.title}</span>
                      <Badge variant="secondary">{product.variantInventoryQty} left</Badge>
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
                  <CardDescription>{inventoryData.outOfStock.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {inventoryData.outOfStock.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between">
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
                  <CardDescription>{inventoryData.wellStocked.length} products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {inventoryData.wellStocked.length} products have healthy inventory levels
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
                  {tagAnalysis.popularTags.map((tag, index) => (
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
                  {tagAnalysis.productTypes.slice(0, 8).map((type, index) => (
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
                    <Badge variant="destructive">{tagAnalysis.untagged.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">No Category Assigned</span>
                    <Badge variant="secondary">{tagAnalysis.noCategory.length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Top Vendors</CardTitle>
                  <CardDescription>Most represented vendors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tagAnalysis.vendors.map((vendor, index) => (
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
                  <CardDescription>Simulated performance by product type</CardDescription>
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
                  <CardTitle>Product Performance Trend</CardTitle>
                  <CardDescription>Simulated 30-day performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      data={Array.from({ length: 30 }, (_, i) => ({
                        day: i + 1,
                        sales: Math.floor(Math.random() * 1000) + 200,
                        views: Math.floor(Math.random() * 5000) + 1000,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                    </AreaChart>
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