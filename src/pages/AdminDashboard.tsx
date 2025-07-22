import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  Shield, 
  Plus,
  Crown,
  Settings
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  domain: string;
  subscription_plan: string;
  subscription_status: string;
  billing_email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const session = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    activeSubscriptions: 0,
    recentActivity: 0
  });

  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    role: 'admin',
    displayName: ''
  });

  useEffect(() => {
    if (session?.user) {
      checkAdminAccess();
      loadDashboardData();
    }
  }, [session]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session?.user?.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin access to this dashboard.",
          variant: "destructive"
        });
        return;
      }

      setIsMasterAdmin(data.role === 'master_admin');
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load admin users
      const { data: admins, error: adminsError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true);

      if (adminsError) {
        console.error('Admins error:', adminsError);
      } else {
        // Transform the data to match our interface
        const transformedAdmins = (admins || []).map(admin => ({
          ...admin,
          profiles: null
        }));
        setAdminUsers(transformedAdmins);
      }

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Load stats
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscriptions } = await supabase
        .from('billing_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: usersCount || 0,
        totalCompanies: companiesCount || 0,
        activeSubscriptions: activeSubscriptions || 0,
        recentActivity: 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMasterAdmin = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-master-admin');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Master admin account created successfully.",
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error creating master admin:', error);
      toast({
        title: "Error",
        description: "Failed to create master admin account.",
        variant: "destructive"
      });
    }
  };

  const createAdminUser = async () => {
    try {
      if (!newAdminForm.email || !newAdminForm.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: newAdminForm
      });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user created successfully.",
      });

      setNewAdminForm({
        email: '',
        password: '',
        role: 'admin',
        displayName: ''
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'default';
      case 'admin': return 'secondary';
      case 'manager': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage PrepFox platform administration</p>
        </div>
        {isMasterAdmin && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Crown className="mr-2 h-4 w-4" />
                  Initialize Master Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Initialize Master Admin</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will create the master admin account (ottman1@gmail.com) with full system access. 
                    This should only be done once during initial setup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={createMasterAdmin}>Initialize</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Users</h2>
            {isMasterAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Admin User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New Admin User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Create a new admin user with specified role and permissions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                        placeholder="admin@prepfox.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAdminForm.password}
                        onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                        placeholder="Secure password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={newAdminForm.displayName}
                        onChange={(e) => setNewAdminForm({...newAdminForm, displayName: e.target.value})}
                        placeholder="Admin Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newAdminForm.role} onValueChange={(value) => setNewAdminForm({...newAdminForm, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={createAdminUser}>Create Admin</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="grid gap-4">
            {adminUsers.map((admin) => (
              <Card key={admin.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{admin.profiles?.display_name || admin.user_id}</p>
                        <p className="text-sm text-muted-foreground">User ID: {admin.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(admin.role)}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <h2 className="text-xl font-semibold">Companies</h2>
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{company.subscription_plan}</Badge>
                      <Badge variant={company.subscription_status === 'active' ? "default" : "secondary"}>
                        {company.subscription_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System activity logs will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}