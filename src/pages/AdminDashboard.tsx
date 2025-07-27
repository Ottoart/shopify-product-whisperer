import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedAdminDashboard } from "@/components/admin/EnhancedAdminDashboard";
import { MasterAdminSetup } from "@/components/MasterAdminSetup";
import { useIsMasterAdmin } from "@/hooks/usePermissions";
import { Users, Building, DollarSign, Activity, Shield, Settings } from "lucide-react";
import { Session } from '@supabase/supabase-js';

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
  const isMasterAdmin = useIsMasterAdmin();
  
  // If no master admin exists yet, show setup component
  if (!isMasterAdmin) {
    return (
      <div className="container mx-auto py-8">
        <MasterAdminSetup />
      </div>
    );
  }

  return <EnhancedAdminDashboard />;
};

export default AdminDashboard;