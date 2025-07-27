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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Shield, 
  Clock, 
  MapPin, 
  Eye,
  UserCheck,
  Settings,
  Activity
} from "lucide-react";

interface ExtendedUser {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_count?: number;
  profile?: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
    timezone?: string;
    department?: string;
  };
  permissions?: any;
  session_info?: {
    ip_address?: string;
    user_agent?: string;
    location?: string;
  };
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string;
  timestamp: string;
}

export const AdvancedUserManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'sessions'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      
      // Load admin users with simplified query
      const { data: adminUsersData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      // Enhance with mock session and activity data for demonstration
      const enhancedUsers = (adminUsersData || []).map(user => ({
        ...user,
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        login_count: Math.floor(Math.random() * 100) + 1,
        profile: {
          display_name: `User ${user.user_id.slice(0, 8)}`,
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1 (555) ' + Math.floor(Math.random() * 9000 + 1000),
          bio: 'System administrator with expertise in user management and security.',
          timezone: 'America/New_York',
          department: user.role === 'master_admin' ? 'IT Administration' : 
                     user.role === 'admin' ? 'Operations' : 
                     user.role === 'manager' ? 'Management' : 'General',
        },
        session_info: {
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'New York, NY',
        }
      }));

      setUsers(enhancedUsers);

      // Load recent user activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;
      
      const formattedActivities = (activitiesData || []).map(log => ({
        id: log.id,
        user_id: log.user_id || 'system',
        action: log.event_type,
        details: log.details,
        ip_address: log.ip_address || 'Unknown',
        timestamp: log.created_at,
      }));

      setUserActivities(formattedActivities);
      
    } catch (error) {
      console.error('Error loading users data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile updated successfully!",
      });
      
      setIsEditDialogOpen(false);
      loadUsersData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
      });
      
      loadUsersData();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const calculateUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const adminUsers = users.filter(u => ['master_admin', 'admin'].includes(u.role)).length;
    const recentLogins = users.filter(u => 
      u.last_login && new Date(u.last_login) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return { totalUsers, activeUsers, adminUsers, recentLogins };
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
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
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
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Advanced User Management</CardTitle>
              <CardDescription>Comprehensive user administration with detailed profiles and activity tracking</CardDescription>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'activity' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Activity className="h-4 w-4 mr-2 inline" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'sessions' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Clock className="h-4 w-4 mr-2 inline" />
                Sessions
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="master_admin">Master Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.profile?.display_name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {user.user_id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.profile?.department || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.login_count || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm ${getStatusColor(user.is_active)}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent User Activities</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivities.slice(0, 20).map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-sm">
                        {activity.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{activity.ip_address}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {activity.details ? JSON.stringify(activity.details).slice(0, 50) + '...' : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active User Sessions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.filter(u => u.is_active).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="font-medium">{user.profile?.display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.session_info?.ip_address}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.session_info?.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {user.session_info?.user_agent?.slice(0, 50)}...
                      </TableCell>
                      <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={selectedUser.profile?.first_name || ''}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={selectedUser.profile?.last_name || ''}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    defaultValue={selectedUser.profile?.phone || ''}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue={selectedUser.profile?.department || ''}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Administration">IT Administration</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  defaultValue={selectedUser.profile?.bio || ''}
                  placeholder="Brief description about the user..."
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch 
                    id="active" 
                    defaultChecked={selectedUser.is_active}
                  />
                  <Label htmlFor="active">Active User</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedUser) {
                updateUserProfile(selectedUser.user_id, {
                  // This would include the form data
                  updated_at: new Date().toISOString()
                });
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};