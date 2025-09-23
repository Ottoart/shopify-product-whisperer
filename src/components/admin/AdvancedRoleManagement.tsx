import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Settings,
  Check,
  X,
  Lock,
  Unlock
} from "lucide-react";

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

interface Permission {
  name: string;
  category: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
}

const systemPermissions: Permission[] = [
  // User Management
  { name: 'user.create', category: 'User Management', description: 'Create new user accounts', risk_level: 'medium' },
  { name: 'user.read', category: 'User Management', description: 'View user information', risk_level: 'low' },
  { name: 'user.update', category: 'User Management', description: 'Modify user profiles', risk_level: 'medium' },
  { name: 'user.delete', category: 'User Management', description: 'Delete user accounts', risk_level: 'high' },
  
  // Admin Management
  { name: 'admin.create', category: 'Admin Management', description: 'Create admin accounts', risk_level: 'high' },
  { name: 'admin.read', category: 'Admin Management', description: 'View admin information', risk_level: 'medium' },
  { name: 'admin.update', category: 'Admin Management', description: 'Modify admin settings', risk_level: 'high' },
  { name: 'admin.delete', category: 'Admin Management', description: 'Remove admin privileges', risk_level: 'high' },
  
  // Data Management
  { name: 'data.create', category: 'Data Management', description: 'Create new data records', risk_level: 'low' },
  { name: 'data.read', category: 'Data Management', description: 'Access data records', risk_level: 'low' },
  { name: 'data.update', category: 'Data Management', description: 'Modify existing data', risk_level: 'medium' },
  { name: 'data.delete', category: 'Data Management', description: 'Delete data records', risk_level: 'high' },
  
  // System Administration
  { name: 'system.config', category: 'System Administration', description: 'Modify system configuration', risk_level: 'high' },
  { name: 'system.logs', category: 'System Administration', description: 'Access system logs', risk_level: 'medium' },
  { name: 'system.backup', category: 'System Administration', description: 'Create system backups', risk_level: 'medium' },
  { name: 'system.restore', category: 'System Administration', description: 'Restore from backups', risk_level: 'high' },
  
  // Billing & Finance
  { name: 'billing.read', category: 'Billing & Finance', description: 'View billing information', risk_level: 'medium' },
  { name: 'billing.update', category: 'Billing & Finance', description: 'Modify billing settings', risk_level: 'high' },
  { name: 'reports.financial', category: 'Billing & Finance', description: 'Generate financial reports', risk_level: 'medium' },
  
  // Security
  { name: 'security.audit', category: 'Security', description: 'View security audit logs', risk_level: 'medium' },
  { name: 'security.configure', category: 'Security', description: 'Configure security settings', risk_level: 'high' },
];

export const AdvancedRoleManagement = () => {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      // Mock data for custom roles (in real implementation, this would come from database)
      const mockRoles: CustomRole[] = [
        {
          id: '1',
          name: 'Super Administrator',
          description: 'Full system access with all permissions',
          permissions: systemPermissions.map(p => p.name),
          is_system_role: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_count: 2
        },
        {
          id: '2',
          name: 'Operations Manager',
          description: 'Operational oversight with user and data management',
          permissions: [
            'user.read', 'user.update', 'data.create', 'data.read', 'data.update',
            'reports.financial', 'system.logs'
          ],
          is_system_role: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_count: 5
        },
        {
          id: '3',
          name: 'Content Editor',
          description: 'Content management and basic user interaction',
          permissions: ['data.create', 'data.read', 'data.update', 'user.read'],
          is_system_role: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_count: 12
        },
        {
          id: '4',
          name: 'Support Agent',
          description: 'Customer support with limited user management',
          permissions: ['user.read', 'user.update', 'data.read', 'system.logs'],
          is_system_role: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_count: 8
        }
      ];

      setRoles(mockRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    try {
      // In real implementation, this would save to database
      const newRoleData: CustomRole = {
        id: Math.random().toString(),
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        is_system_role: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_count: 0
      };

      setRoles([...roles, newRoleData]);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: "Role created successfully!",
      });
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role.",
        variant: "destructive",
      });
    }
  };

  const updateRole = async (roleId: string, updates: Partial<CustomRole>) => {
    try {
      setRoles(roles.map(role => 
        role.id === roleId 
          ? { ...role, ...updates, updated_at: new Date().toISOString() }
          : role
      ));

      toast({
        title: "Success",
        description: "Role updated successfully!",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive",
      });
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (role?.is_system_role) {
        toast({
          title: "Error",
          description: "Cannot delete system roles.",
          variant: "destructive",
        });
        return;
      }

      setRoles(roles.filter(r => r.id !== roleId));
      
      toast({
        title: "Success",
        description: "Role deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive",
      });
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPermissionsByCategory = () => {
    return systemPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const permissionsByCategory = getPermissionsByCategory();

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Advanced Role Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage custom roles with granular permissions
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Custom Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        placeholder="e.g., Content Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roleDescription">Description</Label>
                      <Input
                        id="roleDescription"
                        value={newRole.description}
                        onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                        placeholder="Brief description of the role"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-4 mt-2">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <Card key={category}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">{category}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                              {permissions.map((permission) => (
                                <div key={permission.name} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Switch
                                      checked={newRole.permissions.includes(permission.name)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setNewRole({
                                            ...newRole,
                                            permissions: [...newRole.permissions, permission.name]
                                          });
                                        } else {
                                          setNewRole({
                                            ...newRole,
                                            permissions: newRole.permissions.filter(p => p !== permission.name)
                                          });
                                        }
                                      }}
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{permission.name}</p>
                                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                                    </div>
                                  </div>
                                  <Badge variant={getRiskBadgeVariant(permission.risk_level)}>
                                    {permission.risk_level}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createRole} disabled={!newRole.name || newRole.permissions.length === 0}>
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Roles Table */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {role.is_system_role ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions.length} permissions</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.user_count || 0} users</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_system_role ? "default" : "outline"}>
                        {role.is_system_role ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(role.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.is_system_role && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permission Overview */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle>System Permissions Overview</CardTitle>
          <CardDescription>
            All available permissions in the system categorized by functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(permission.risk_level)}>
                          {permission.risk_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};