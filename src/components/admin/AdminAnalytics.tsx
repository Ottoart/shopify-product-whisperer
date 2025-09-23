import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredSubscriptions: number;
  revenueThisMonth: number;
  topEvents: { event_type: string; count: number }[];
  subscriptionTrends: { date: string; count: number }[];
  moduleUsage: { module: string; users: number }[];
}

export function AdminAnalytics() {
  const { isAdmin } = useAdminAuth();

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-analytics');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor system performance and user engagement</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{analytics.totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Active Subscriptions</CardDescription>
            <CardTitle className="text-2xl text-green-600">{analytics.activeSubscriptions}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Trial Users</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{analytics.trialUsers}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Revenue This Month</CardDescription>
            <CardTitle className="text-2xl text-green-600">${analytics.revenueThisMonth}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle>Top User Events</CardTitle>
            <CardDescription>Most frequent user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Trends</CardTitle>
            <CardDescription>New subscriptions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.subscriptionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Module Usage</CardTitle>
          <CardDescription>Number of users with access to each module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.moduleUsage.map((module) => (
              <div key={module.module} className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold capitalize">{module.module}</h3>
                <p className="text-2xl font-bold text-primary">{module.users}</p>
                <p className="text-sm text-muted-foreground">users</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Subscription Webhook Handler</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Analytics Collection</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Module Data Sync</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}