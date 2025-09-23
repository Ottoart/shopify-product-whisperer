import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedAdminDashboard } from "@/components/admin/EnhancedAdminDashboard";
import { MasterAdminSetup } from "@/components/MasterAdminSetup";
import { useMasterAdminExists } from "@/hooks/usePermissions";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Lock } from "lucide-react";
import { AdminLogin } from "@/components/AdminLogin";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
  };
}

interface Company {
  id: string;
  name: string;
  domain?: string;
  subscription_plan?: string;
  subscription_status?: string;
  billing_email?: string;
}

const AdminDashboard = () => {
  const { data: masterAdminExists, isLoading: masterAdminLoading } = useMasterAdminExists();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAdminAuth();

  // Loading state
  if (masterAdminLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin access...</p>
        </div>
      </div>
    );
  }

  // If no master admin exists yet, show setup component
  if (!masterAdminExists) {
    return (
      <div className="container mx-auto py-8">
        <MasterAdminSetup />
      </div>
    );
  }

  // If master admin exists but user is not authenticated, show admin login
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // If user is authenticated but not an admin, show permission denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in and has admin access, show admin dashboard
  return <EnhancedAdminDashboard />;
};

export default AdminDashboard;