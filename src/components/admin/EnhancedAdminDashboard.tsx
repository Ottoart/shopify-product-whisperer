import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdvancedUserManagement } from "./AdvancedUserManagement";
import { AdvancedRoleManagement } from "./AdvancedRoleManagement";
import { SessionManagement } from "./SessionManagement";
import { EnhancedCompanyDashboard } from "./EnhancedCompanyDashboard";
import { BillingOperationsHub } from "./BillingOperationsHub";
import { CustomerSupportIntegration } from "./CustomerSupportIntegration";
import { AdminCommunicationCenter } from "./AdminCommunicationCenter";
import { OperationalMonitoring } from "./OperationalMonitoring";
import { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
import { CustomReportBuilder } from "./CustomReportBuilder";
import { DataExportImport } from "./DataExportImport";
import { PerformanceTrending } from "./PerformanceTrending";
import { EnhancedAuditLogging } from "./EnhancedAuditLogging";
import { DataProtectionPrivacy } from "./DataProtectionPrivacy";
import { SecurityMonitoring } from "./SecurityMonitoring";
import { BackupRecoveryManagement } from "./BackupRecoveryManagement";
import { PermissionManagement } from "./PermissionManagement";
import { RolePermissionsOverview } from "./RolePermissionsOverview";
import { SystemLogs } from "./SystemLogs";
import { 
  Users, 
  Building, 
  DollarSign, 
  Activity, 
  Shield, 
  Settings, 
  TrendingUp,
  Server,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileText,
  Database,
  TrendingDown,
  Lock,
  Eye,
  Archive,
  HardDrive
} from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
  domain?: string;
  subscription_plan?: string;
  subscription_status?: string;
  billing_email?: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  activeConnections: number;
  lastBackup: string;
}

export const EnhancedAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '99.9%',
    activeConnections: 127,
    lastBackup: '2 hours ago'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    systemAlerts: 2,
    pendingActions: 5
  });
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);


  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load admin users
      const { data: adminUsersData, error: adminError } = await supabase
        .from('admin_users')
        .select('*');

      if (adminError) {
        console.error('Error loading admin users:', adminError);
      } else {
        setAdminUsers(adminUsersData || []);
      }

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) {
        console.error('Error loading companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

      // Calculate enhanced stats
      const totalRevenue = 15420.50; // This would come from billing data
      const systemAlerts = 2;
      const pendingActions = 5;

      setStats({
        totalUsers: (adminUsersData || []).length,
        totalCompanies: (companiesData || []).length,
        activeSubscriptions: (companiesData || []).filter(c => c.subscription_status === 'active').length,
        totalRevenue,
        systemAlerts,
        pendingActions
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  if (loading) {
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

  // This component should only be rendered when admin is authenticated
  // The parent AdminDashboard component handles the authentication flow

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
      <Tabs defaultValue="admin-users" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="admin-users" className="data-[state=active]:bg-background">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-background">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-background">
              <Building className="h-4 w-4 mr-2" />
              Companies
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="billing" className="data-[state=active]:bg-background">
              <DollarSign className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-background">
              <Settings className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-background">
              <Server className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-background">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="data-export" className="data-[state=active]:bg-background">
              <Database className="h-4 w-4 mr-2" />
              Data Export
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-background">
              <TrendingDown className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="audit-logs" className="data-[state=active]:bg-background">
              <Eye className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="data-protection" className="data-[state=active]:bg-background">
              <Lock className="h-4 w-4 mr-2" />
              Data Protection
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="security" className="data-[state=active]:bg-background">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="backup-recovery" className="data-[state=active]:bg-background">
              <HardDrive className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="admin-users" className="space-y-4">
          <AdvancedUserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <AdvancedRoleManagement />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <EnhancedCompanyDashboard />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <BillingOperationsHub />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <CustomerSupportIntegration />
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <AdminCommunicationCenter />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <OperationalMonitoring />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CustomReportBuilder />
        </TabsContent>

        <TabsContent value="data-export" className="space-y-4">
          <DataExportImport />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <PerformanceTrending />
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <EnhancedAuditLogging />
        </TabsContent>

        <TabsContent value="data-protection" className="space-y-4">
          <DataProtectionPrivacy />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="backup-recovery" className="space-y-4">
          <BackupRecoveryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};