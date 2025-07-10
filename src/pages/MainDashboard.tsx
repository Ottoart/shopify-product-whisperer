import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, Activity, Zap, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

const MainDashboard = () => {
  const { session } = useSessionContext();
  const { products, isLoading } = useProducts();

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary-foreground">
              <TrendingUp className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                <p className="text-primary-foreground/80">Your command center for product management</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Package className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your catalog</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : products.length.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total products in store</p>
              <Link to="/">
                <Button variant="outline" size="sm" className="mt-2">
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Learning */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-success flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Learning from your edits</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">Pattern accuracy</p>
              <Link to="/ai-dashboard">
                <Button variant="outline" size="sm" className="mt-2">
                  View AI Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-warning flex items-center justify-center">
                  <Activity className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Recent changes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Updates today</p>
              <Link to="/activity">
                <Button variant="outline" size="sm" className="mt-2">
                  View Activity
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shopify Integration */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Shopify Sync</CardTitle>
                  <CardDescription>Store connection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <p className="text-xs text-muted-foreground">Last sync: 2 hours ago</p>
              <Link to="/shopify-integration">
                <Button variant="outline" size="sm" className="mt-2">
                  Manage Integration
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-success flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15.2%</div>
              <p className="text-xs text-muted-foreground">Conversion improvement</p>
              <Link to="/analytics">
                <Button variant="outline" size="sm" className="mt-2">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Bulk Operations */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-warning flex items-center justify-center">
                  <Users className="h-5 w-5 text-warning-foreground" />
                </div>
                <div>
                  <CardTitle>Bulk Editor</CardTitle>
                  <CardDescription>Mass operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Operations in queue</p>
              <Link to="/bulk-editor">
                <Button variant="outline" size="sm" className="mt-2">
                  Open Editor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;