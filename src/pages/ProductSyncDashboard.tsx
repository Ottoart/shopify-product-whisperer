import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StoreConnectionHub } from '@/components/product-sync/StoreConnectionHub';
import { SyncStatusPanel } from '@/components/product-sync/SyncStatusPanel';
import { ProductGrid } from '@/components/product-sync/ProductGrid';
import { OptimizationCenter } from '@/components/product-sync/OptimizationCenter';
import { Store, RefreshCw, Grid3X3, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  connectedStores: number;
  syncedProducts: number;
  activeSyncs: number;
  optimizationScore: number;
}

export default function ProductSyncDashboard() {
  const [activeTab, setActiveTab] = useState('stores');
  const [stats, setStats] = useState<DashboardStats>({
    connectedStores: 0,
    syncedProducts: 0,
    activeSyncs: 0,
    optimizationScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Load store connections
      const { data: stores, error: storesError } = await supabase
        .from('store_connections')
        .select('*')
        .eq('connection_status', 'connected');
      
      if (storesError) throw storesError;

      // Load synced products
      const { data: products, error: productsError } = await supabase
        .from('synced_products')
        .select('*');
      
      if (productsError) throw productsError;

      // Calculate optimization score (average of all products)
      const avgOptimization = products?.length > 0 
        ? products.reduce((sum, p) => sum + (p.optimization_score || 0), 0) / products.length 
        : 0;

      // Count active syncs
      const activeSyncs = stores?.filter(s => s.sync_status === 'syncing').length || 0;

      setStats({
        connectedStores: stores?.length || 0,
        syncedProducts: products?.length || 0,
        activeSyncs,
        optimizationScore: Math.round(avgOptimization)
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardStats();
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Sync & Optimization</h1>
          <p className="text-muted-foreground mt-1">
            Connect stores, sync products, and optimize your catalog with AI
          </p>
        </div>
        <Button 
          onClick={refreshData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="prep-fox-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Stores</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{loading ? '-' : stats.connectedStores}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSyncs > 0 && (
                <Badge variant="secondary" className="mt-1">
                  {stats.activeSyncs} syncing
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced Products</CardTitle>
            <Grid3X3 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{loading ? '-' : stats.syncedProducts}</div>
            <p className="text-xs text-muted-foreground">Across all stores</p>
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-glow">
              {loading ? '-' : `${stats.optimizationScore}%`}
            </div>
            <Progress 
              value={loading ? 0 : stats.optimizationScore} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="prep-fox-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Zap className="h-4 w-4 text-accent-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-glow">
              {loading ? '-' : Math.floor(stats.syncedProducts * 0.3)}
            </div>
            <p className="text-xs text-muted-foreground">Available recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stores" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store Connections
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Status
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          <StoreConnectionHub onConnectionChange={refreshData} />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <SyncStatusPanel onSyncComplete={refreshData} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductGrid onProductUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <OptimizationCenter onOptimizationApplied={refreshData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}