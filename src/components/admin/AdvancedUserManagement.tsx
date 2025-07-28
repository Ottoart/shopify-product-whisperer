import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Search, 
  Eye,
  Shield, 
  Store,
  Package,
  CreditCard,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface ComprehensiveUser {
  id: string;
  user_id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  email?: string;
  is_admin: boolean;
  admin_role?: string;
  stores_count: number;
  submissions_count: number;
  total_payments: number;
  last_activity?: string;
  stores?: Array<{
    id: string;
    store_name: string;
    platform: string;
    domain: string;
    is_active: boolean;
  }>;
  submissions?: Array<{
    id: string;
    submission_number: string;
    status: string;
    total_prep_cost: number;
    created_at: string;
  }>;
  payments?: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
}

export const AdvancedUserManagement = () => {
  const [users, setUsers] = useState<ComprehensiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ComprehensiveUser | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { adminSession, sessionStable, isLoading: authLoading } = useAdminAuth();

  useEffect(() => {
    console.log('🎯 useEffect triggered:', { authLoading, sessionStable, adminSession: !!adminSession });
    
    if (!authLoading && adminSession) {
      if (sessionStable) {
        console.log('🟢 Session is stable, loading data immediately');
        loadUsersData();
      } else {
        console.log('🟡 Session exists but not stable, using fallback loading');
        // Multiple fallback attempts
        const timeout1 = setTimeout(() => {
          if (adminSession) {
            console.log('⏰ First fallback attempt (1s)');
            loadUsersData(true);
          }
        }, 1000);
        
        const timeout2 = setTimeout(() => {
          if (adminSession && users.length === 0 && !loading) {
            console.log('⏰ Second fallback attempt (3s)');
            loadUsersData(true);
          }
        }, 3000);
        
        return () => {
          clearTimeout(timeout1);
          clearTimeout(timeout2);
        };
      }
    } else {
      console.log('🔴 Not ready to load:', { authLoading, hasSession: !!adminSession });
    }
  }, [authLoading, sessionStable, adminSession]);

  const loadUsersData = async (retry = false) => {
    try {
      setLoading(true);
      
      if (!sessionStable || !adminSession) {
        if (!retry && retryCount < 3) {
          console.log('Admin session not stable, retrying in 1 second...');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadUsersData(true);
          }, 1000);
          return;
        }
        console.error('No stable admin session found after retries');
        toast({
          title: "Session Error",
          description: "Admin session is not available. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Loading users with admin session:', adminSession.user.email);

      // Load all users using admin endpoint
      const { data: usersResult, error: usersError } = await supabase.functions.invoke('admin-data', {
        body: { 
          data_type: 'all_users',
          session_token: adminSession.session_id 
        }
      });

      if (usersError || !usersResult.success) {
        console.error('Error loading users:', usersError || usersResult.error);
        throw new Error(usersResult.error || 'Failed to load users');
      }

      const profilesData = usersResult.data || [];

      // Load admin users using admin endpoint
      const { data: adminUsersResult, error: adminError } = await supabase.functions.invoke('admin-data', {
        body: { 
          data_type: 'admin_users',
          session_token: adminSession.session_id 
        }
      });

      if (adminError || !adminUsersResult.success) {
        console.error('Error loading admin users:', adminError || adminUsersResult.error);
      }

      const adminUsersData = adminUsersResult.data || [];

      // For now, use empty arrays for stores and submissions since we need service-role access
      // TODO: Add these data types to the admin-data endpoint
      const storesData = [];
      const submissionsData = [];

      // Process and combine all data
      const comprehensiveUsers: ComprehensiveUser[] = (profilesData || []).map(profile => {
        const userStores = storesData?.filter(store => store.user_id === profile.user_id) || [];
        const userSubmissions = submissionsData?.filter(sub => sub.user_id === profile.user_id) || [];
        const adminUser = adminUsersData?.find(admin => admin.user_id === profile.user_id);
        
        // Calculate totals
        const totalPayments = userSubmissions.reduce((sum, sub) => {
          const invoices = sub.submission_invoices || [];
          return sum + invoices.reduce((invSum: number, inv: any) => invSum + (inv.amount_cents || 0), 0);
        }, 0);

        // Get last activity (most recent submission or store creation)
        const lastActivity = [...userStores, ...userSubmissions]
          .map(item => new Date(item.created_at))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name,
          first_name: undefined, // Not available in profiles schema
          last_name: undefined,  // Not available in profiles schema
          phone: profile.phone,
          created_at: profile.created_at,
          is_admin: !!adminUser,
          admin_role: adminUser?.role,
          stores_count: userStores.length,
          submissions_count: userSubmissions.length,
          total_payments: totalPayments / 100, // Convert cents to dollars
          last_activity: lastActivity?.toISOString(),
          stores: userStores.map(store => ({
            id: store.id,
            store_name: store.store_name,
            platform: store.platform,
            domain: store.domain,
            is_active: store.is_active
          })),
          submissions: userSubmissions.map(sub => ({
            id: sub.id,
            submission_number: sub.submission_number,
            status: sub.status,
            total_prep_cost: sub.total_prep_cost || 0,
            created_at: sub.created_at
          })),
          payments: userSubmissions.flatMap(sub => 
            (sub.submission_invoices || []).map((inv: any) => ({
              id: inv.id || `${sub.id}-payment`,
              amount_cents: inv.amount_cents || 0,
              currency: inv.currency || 'USD',
              status: inv.status || 'unknown',
              created_at: inv.created_at || sub.created_at
            }))
          )
        };
      });

      setUsers(comprehensiveUsers);
      setRetryCount(0); // Reset retry count on success
      console.log(`Loaded ${comprehensiveUsers.length} users successfully`);
      
    } catch (error) {
      console.error('Error loading users data:', error);
      if (retryCount < 2) {
        console.log(`Retrying load users (attempt ${retryCount + 1})...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadUsersData(true);
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: "Failed to load user data after multiple attempts.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'paid': return 'outline';
      case 'approved': return 'default';
      case 'shipped': return 'default';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || 
      user.stores?.some(store => store.platform === platformFilter);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'admin' && user.is_admin) ||
      (statusFilter === 'regular' && !user.is_admin);

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const calculateUserStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.is_admin).length;
    const totalStores = users.reduce((sum, u) => sum + u.stores_count, 0);
    const totalSubmissions = users.reduce((sum, u) => sum + u.submissions_count, 0);

    return { totalUsers, adminUsers, totalStores, totalSubmissions };
  };

  const stats = calculateUserStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">With admin access</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Inventory submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle>All Platform Users</CardTitle>
          <CardDescription>Comprehensive view of all users with their stores, submissions, and payment information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {authLoading || loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {authLoading ? 'Authenticating...' : 'Loading users...'}
                </p>
                {retryCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Retry attempt {retryCount}/3
                  </p>
                )}
              </div>
            </div>
          ) : !sessionStable || !adminSession ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground">Admin session not available. Please sign in again.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.user_id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserExpansion(user.user_id)}
                        >
                          {expandedUsers.has(user.user_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {user.user_id.slice(0, 8)}...
                            </p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.admin_role?.replace('_', ' ') || 'Admin'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Regular User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Store className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{user.stores_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{user.submissions_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            ${user.total_payments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'No activity'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    {expandedUsers.has(user.user_id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            {/* Stores */}
                            {user.stores && user.stores.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center">
                                  <Store className="h-4 w-4 mr-2" />
                                  Connected Stores ({user.stores.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {user.stores.map((store) => (
                                    <div key={store.id} className="p-2 bg-background rounded border">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">{store.store_name}</p>
                                          <p className="text-xs text-muted-foreground">{store.domain}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline" className="text-xs">
                                            {store.platform}
                                          </Badge>
                                          <div className={`h-2 w-2 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Submissions */}
                            {user.submissions && user.submissions.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  Recent Submissions ({user.submissions.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {user.submissions.slice(0, 4).map((submission) => (
                                    <div key={submission.id} className="p-2 bg-background rounded border">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">{submission.submission_number}</p>
                                          <p className="text-xs text-muted-foreground">
                                            ${submission.total_prep_cost.toFixed(2)} • {new Date(submission.created_at).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(submission.status)} className="text-xs">
                                          {submission.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payments */}
                            {user.payments && user.payments.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Recent Payments ({user.payments.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {user.payments.slice(0, 4).map((payment) => (
                                    <div key={payment.id} className="p-2 bg-background rounded border">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">
                                            ${(payment.amount_cents / 100).toFixed(2)} {payment.currency}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(payment.status)} className="text-xs">
                                          {payment.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No data states */}
                            {(!user.stores || user.stores.length === 0) && 
                             (!user.submissions || user.submissions.length === 0) && 
                             (!user.payments || user.payments.length === 0) && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No additional data available for this user
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.display_name || 'user'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Display Name</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.display_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">
                    {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Registration Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">User Type</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.is_admin ? `Admin (${selectedUser.admin_role})` : 'Regular User'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedUser.user_id}</p>
                </div>
              </div>

              {/* Detailed Stores */}
              {selectedUser.stores && selectedUser.stores.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Connected Stores</h3>
                  <div className="space-y-2">
                    {selectedUser.stores.map((store) => (
                      <div key={store.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{store.store_name}</p>
                            <p className="text-sm text-muted-foreground">{store.domain}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{store.platform}</Badge>
                            <Badge variant={store.is_active ? "default" : "secondary"}>
                              {store.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Submissions */}
              {selectedUser.submissions && selectedUser.submissions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Inventory Submissions</h3>
                  <div className="space-y-2">
                    {selectedUser.submissions.map((submission) => (
                      <div key={submission.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{submission.submission_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">${submission.total_prep_cost.toFixed(2)}</p>
                            <Badge variant={getStatusBadgeVariant(submission.status)}>
                              {submission.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Payments */}
              {selectedUser.payments && selectedUser.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedUser.payments.map((payment) => (
                      <div key={payment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              ${(payment.amount_cents / 100).toFixed(2)} {payment.currency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};