import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  Mail,
  DollarSign,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Building
} from 'lucide-react';

// Import new admin components
import { UserSelector } from './UserSelector';
import { AdminSubscriptionCard } from './AdminSubscriptionCard';
import { AdminActionButtons } from './AdminActionButtons';
import { useAdminUsers, useUpdateSubscription, useSubscriptionAction, type AdminUser } from '@/hooks/useAdminUsers';
import { useSubscription } from '@/hooks/useSubscription';
import { ModuleOverviewGrid } from '@/components/ModuleOverviewGrid';
import { AdminAnalytics } from './AdminAnalytics';
import { SubscriptionBadge } from '../subscription/SubscriptionBadge';

// Import existing admin components (simplified)
import { AdvancedUserManagement } from "./AdvancedUserManagement";

export const EnhancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Admin data hooks
  const { data: users, isLoading: isLoadingUsers } = useAdminUsers();
  const { data: userSubscription } = useSubscription(selectedUser?.id);
  const updateSubscription = useUpdateSubscription();
  const subscriptionAction = useSubscriptionAction();

  const handleSubscriptionUpdate = async (data: any) => {
    updateSubscription.mutate(data);
  };

  const handleSubscriptionAction = async (data: any) => {
    subscriptionAction.mutate(data);
  };

  const isUpdating = updateSubscription.isPending;
  const isProcessing = subscriptionAction.isPending;

  // Mock stats
  const stats = {
    totalUsers: users?.length || 0,
    totalCompanies: 1,
    activeSubscriptions: users?.filter(u => u.subscription?.status === 'active').length || 0,
    totalRevenue: 0,
    systemAlerts: 2,
    pendingActions: 5
  };

  const systemHealth = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    uptime: '99.9%',
    activeConnections: 127,
    lastBackup: '2 hours ago'
  };

  const getSystemHealthIcon = () => {
    switch (systemHealth.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive system administration and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getSystemHealthIcon()}
          <span className="text-sm font-medium">System {systemHealth.status}</span>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">2 warning, 0 critical</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.activeConnections}</div>
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold capitalize text-green-600">{systemHealth.status}</div>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.lastBackup}</div>
              <p className="text-sm text-muted-foreground">Last Backup</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Admin Overview
                </CardTitle>
                <CardDescription>
                  Quick overview of system health and key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}</div>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{systemHealth.activeConnections}</div>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <AdvancedUserManagement />
        </TabsContent>

        {/* New Subscription Management Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>
                  Manage user subscriptions, plans, and entitlements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {users && (
                  <UserSelector
                    users={users}
                    selectedUser={selectedUser}
                    onUserSelect={setSelectedUser}
                    isLoading={isLoadingUsers}
                  />
                )}

                {selectedUser && userSubscription && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <AdminSubscriptionCard
                      user={selectedUser}
                      subscription={userSubscription}
                      onUpdate={handleSubscriptionUpdate}
                      isUpdating={isUpdating}
                    />
                    
                    <div className="space-y-4">
                      <AdminActionButtons
                        userId={selectedUser.id}
                        subscription={userSubscription}
                        onAction={handleSubscriptionAction}
                        isProcessing={isProcessing}
                      />
                    </div>
                  </div>
                )}

                {selectedUser && userSubscription && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">User Module Overview</h3>
                    <ModuleOverviewGrid targetUserId={selectedUser.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};