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
  Building,
  Truck,
  Brain,
  Lock,
  FileText,
  MessageSquare,
  Download,
  UserCheck,
  Wrench
} from 'lucide-react';

// Import admin components
import { UserSelector } from './UserSelector';
import { AdminSubscriptionCard } from './AdminSubscriptionCard';
import { AdminActionButtons } from './AdminActionButtons';
import { useAdminUsers, useUpdateSubscription, useSubscriptionAction, type AdminUser } from '@/hooks/useAdminUsers';
import { useSubscription } from '@/hooks/useSubscription';
import { ModuleOverviewGrid } from '@/components/ModuleOverviewGrid';
import { AdminAnalytics } from './AdminAnalytics';
import { AdvancedUserManagement } from "./AdvancedUserManagement";

// Import comprehensive admin components
import { CarrierConfigurationManagement } from './CarrierConfigurationManagement';
import { OperationalMonitoring } from './OperationalMonitoring';
import { SecurityMonitoring } from './SecurityMonitoring';
import { BillingManagement } from './BillingManagement';

// Import additional components we need to create
import { SystemLogs } from './SystemLogs';
import { AIConfiguration } from './AIConfiguration';
import { CommunicationsManagement } from './CommunicationsManagement';
import { DataManagement } from './DataManagement';
import { PermissionsManagement } from './PermissionsManagement';

export const ComprehensiveAdminDashboard = () => {
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

  // Enhanced stats with all admin areas
  const stats = {
    totalUsers: users?.length || 0,
    totalCompanies: 1,
    activeSubscriptions: users?.filter(u => u.subscription?.status === 'active').length || 0,
    totalRevenue: 12450,
    systemAlerts: 3,
    pendingActions: 8,
    activeCarriers: 5,
    securityThreats: 2,
    systemUptime: 99.8,
    dataBackups: 24
  };

  const systemHealth = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    uptime: '99.8%',
    activeConnections: 147,
    lastBackup: '1 hour ago',
    securityScore: 95,
    performanceIndex: 87
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
            <p className="mt-2 text-muted-foreground">Loading comprehensive admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Master Admin Control Center
          </h1>
          <p className="text-muted-foreground">
            Comprehensive system administration, monitoring, and configuration management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getSystemHealthIcon()}
            <span className="text-sm font-medium">System {systemHealth.status}</span>
          </div>
          <Badge variant={systemHealth.securityScore > 90 ? "default" : "destructive"}>
            Security: {systemHealth.securityScore}%
          </Badge>
        </div>
      </div>

      {/* Comprehensive Stats Grid - 10 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% growth</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Enterprise</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% MRR</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carriers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCarriers}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.securityThreats}</div>
            <p className="text-xs text-muted-foreground">Threats</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30d</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dataBackups}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Systems</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Running</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced System Health Overview */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Master System Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.activeConnections}</div>
              <p className="text-sm text-muted-foreground">Connections</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold capitalize text-green-600">{systemHealth.status}</div>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.lastBackup}</div>
              <p className="text-sm text-muted-foreground">Last Backup</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.securityScore}%</div>
              <p className="text-sm text-muted-foreground">Security</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemHealth.performanceIndex}%</div>
              <p className="text-sm text-muted-foreground">Performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Admin Tabs - 11 tabs total */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-11 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col items-center p-2 text-xs">
            <BarChart3 className="h-4 w-4 mb-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex flex-col items-center p-2 text-xs">
            <Users className="h-4 w-4 mb-1" />
            Users
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex flex-col items-center p-2 text-xs">
            <DollarSign className="h-4 w-4 mb-1" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex flex-col items-center p-2 text-xs">
            <Truck className="h-4 w-4 mb-1" />
            Carriers
          </TabsTrigger>
          <TabsTrigger value="system" className="flex flex-col items-center p-2 text-xs">
            <Server className="h-4 w-4 mb-1" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col items-center p-2 text-xs">
            <Shield className="h-4 w-4 mb-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center p-2 text-xs">
            <Brain className="h-4 w-4 mb-1" />
            AI Config
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex flex-col items-center p-2 text-xs">
            <MessageSquare className="h-4 w-4 mb-1" />
            Comms
          </TabsTrigger>
          <TabsTrigger value="data" className="flex flex-col items-center p-2 text-xs">
            <Database className="h-4 w-4 mb-1" />
            Data
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex flex-col items-center p-2 text-xs">
            <UserCheck className="h-4 w-4 mb-1" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center p-2 text-xs">
            <BarChart3 className="h-4 w-4 mb-1" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Master Admin Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive system health, metrics, and quick actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.activeCarriers}</div>
                    <p className="text-sm text-muted-foreground">Carrier Integrations</p>
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

        {/* Subscriptions/Billing Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing & Subscription Management
                </CardTitle>
                <CardDescription>
                  Comprehensive billing operations and subscription management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="subscriptions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
                    <TabsTrigger value="billing">Billing Operations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="subscriptions" className="space-y-6">
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
                  </TabsContent>
                  
                  <TabsContent value="billing">
                    <BillingManagement />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Carriers Tab */}
        <TabsContent value="carriers" className="space-y-6">
          <CarrierConfigurationManagement />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6">
            <Tabs defaultValue="monitoring" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
                <TabsTrigger value="logs">System Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monitoring">
                <OperationalMonitoring />
              </TabsContent>
              
              <TabsContent value="logs">
                <SystemLogs />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityMonitoring />
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai" className="space-y-6">
          <AIConfiguration />
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <CommunicationsManagement />
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <DataManagement />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <PermissionsManagement />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};