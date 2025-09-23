import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Shield, Users, Lock, Key, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  isGlobal: boolean;
}

interface UserPermission {
  userId: string;
  userEmail: string;
  role: string;
  permissions: string[];
  lastModified: string;
}

export const PermissionsManagement = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'master_admin',
      name: 'Master Administrator',
      description: 'Full system access and control',
      userCount: 2,
      permissions: ['*'],
      isSystem: true
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access to most features',
      userCount: 5,
      permissions: ['user_manage', 'billing_view', 'system_monitor'],
      isSystem: true
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access to business operations',
      userCount: 12,
      permissions: ['user_view', 'billing_view', 'orders_manage'],
      isSystem: false
    },
    {
      id: 'support',
      name: 'Support Agent',
      description: 'Customer support and basic administrative tasks',
      userCount: 8,
      permissions: ['tickets_manage', 'user_view', 'orders_view'],
      isSystem: false
    }
  ]);

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'user_manage',
      name: 'Manage Users',
      category: 'User Management',
      description: 'Create, edit, and delete user accounts',
      isGlobal: true
    },
    {
      id: 'user_view',
      name: 'View Users',
      category: 'User Management',
      description: 'View user profiles and information',
      isGlobal: true
    },
    {
      id: 'billing_manage',
      name: 'Manage Billing',
      category: 'Financial',
      description: 'Modify billing and subscription settings',
      isGlobal: true
    },
    {
      id: 'billing_view',
      name: 'View Billing',
      category: 'Financial',
      description: 'View billing information and reports',
      isGlobal: true
    },
    {
      id: 'system_monitor',
      name: 'System Monitoring',
      category: 'System',
      description: 'Access system health and monitoring tools',
      isGlobal: true
    },
    {
      id: 'orders_manage',
      name: 'Manage Orders',
      category: 'Operations',
      description: 'Create, modify, and process orders',
      isGlobal: false
    },
    {
      id: 'orders_view',
      name: 'View Orders',
      category: 'Operations',
      description: 'View order information and history',
      isGlobal: false
    }
  ]);

  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([
    {
      userId: '1',
      userEmail: 'admin@example.com',
      role: 'master_admin',
      permissions: ['*'],
      lastModified: '2024-01-15'
    },
    {
      userId: '2',
      userEmail: 'manager@example.com',
      role: 'manager',
      permissions: ['user_view', 'billing_view', 'orders_manage'],
      lastModified: '2024-01-14'
    }
  ]);

  const { toast } = useToast();

  const permissionCategories = Array.from(new Set(permissions.map(p => p.category)));

  const handleRoleUpdate = (roleId: string, updates: Partial<Role>) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, ...updates } : role
    ));
    toast({
      title: "Role Updated",
      description: "Role permissions have been successfully updated",
    });
  };

  const createRole = () => {
    toast({
      title: "Create Role",
      description: "Role creation form would open here",
    });
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive"
      });
      return;
    }
    
    setRoles(roles.filter(r => r.id !== roleId));
    toast({
      title: "Role Deleted",
      description: "Role has been permanently removed",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Permissions & Role Management
          </CardTitle>
          <CardDescription>
            Manage user roles, permissions, and access control across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="users">User Permissions</TabsTrigger>
              <TabsTrigger value="audit">Access Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Roles</h3>
                <Button onClick={createRole}>
                  <Users className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>

              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{role.name}</h4>
                          {role.isSystem && (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              System Role
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {role.userCount} users
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {role.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions[0] === '*' ? (
                              <Badge variant="default">All Permissions</Badge>
                            ) : (
                              role.permissions.map(permission => (
                                <Badge key={permission} variant="outline">
                                  {permissions.find(p => p.id === permission)?.name || permission}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {!role.isSystem && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteRole(role.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Permissions</h3>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </div>

              {permissionCategories.map(category => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {permissions
                        .filter(p => p.category === category)
                        .map(permission => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{permission.name}</h4>
                                {permission.isGlobal && (
                                  <Badge variant="outline">Global</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Permissions</h3>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button>
                    Assign Permissions
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {userPermissions.map((userPerm) => (
                  <Card key={userPerm.userId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{userPerm.userEmail}</h4>
                          <Badge variant="default">
                            {roles.find(r => r.id === userPerm.role)?.name || userPerm.role}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Last modified: {userPerm.lastModified}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {userPerm.permissions[0] === '*' ? (
                              <Badge variant="default">All Permissions</Badge>
                            ) : (
                              userPerm.permissions.map(permission => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permissions.find(p => p.id === permission)?.name || permission}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit Permissions
                        </Button>
                        <Button variant="outline" size="sm">
                          View Activity
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Audit Log
                  </CardTitle>
                  <CardDescription>
                    Track and monitor permission changes and access attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Search audit logs..." className="flex-1" />
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Action type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="login">Login</SelectItem>
                          <SelectItem value="permission_change">Permission Change</SelectItem>
                          <SelectItem value="role_assignment">Role Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        {
                          action: 'Role assignment changed',
                          user: 'admin@example.com',
                          target: 'manager@example.com',
                          timestamp: '2024-01-15 14:30:00',
                          type: 'permission_change'
                        },
                        {
                          action: 'Admin login successful',
                          user: 'admin@example.com',
                          target: 'System',
                          timestamp: '2024-01-15 13:45:00',
                          type: 'login'
                        },
                        {
                          action: 'New role created',
                          user: 'master_admin@example.com',
                          target: 'Support Agent Role',
                          timestamp: '2024-01-15 11:20:00',
                          type: 'role_assignment'
                        }
                      ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{log.action}</p>
                              <Badge variant="outline">{log.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              By: {log.user} | Target: {log.target}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {log.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};