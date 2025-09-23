import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Key, Users, Activity, AlertTriangle, Lock, Eye, Download, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SecurityEvent {
  id: string;
  type: 'login' | 'permission_change' | 'data_access' | 'failed_auth' | 'api_usage';
  user: string;
  timestamp: Date;
  details: string;
  riskLevel: 'low' | 'medium' | 'high';
  ipAddress: string;
}

interface AccessRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_auth',
    user: 'unknown@example.com',
    timestamp: new Date('2024-01-15T14:30:00'),
    details: 'Multiple failed login attempts',
    riskLevel: 'high',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    type: 'permission_change',
    user: 'admin@company.com',
    timestamp: new Date('2024-01-15T13:15:00'),
    details: 'Added bulk edit permissions to Marketing role',
    riskLevel: 'medium',
    ipAddress: '10.0.0.5'
  },
  {
    id: '3',
    type: 'data_access',
    user: 'analyst@company.com',
    timestamp: new Date('2024-01-15T12:00:00'),
    details: 'Exported customer analytics report',
    riskLevel: 'low',
    ipAddress: '10.0.0.12'
  }
];

const mockRoles: AccessRole[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access and management capabilities',
    permissions: ['manage_users', 'view_analytics', 'bulk_operations', 'system_config'],
    userCount: 3,
    isActive: true
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Team management and reporting access',
    permissions: ['view_analytics', 'bulk_operations', 'team_management'],
    userCount: 8,
    isActive: true
  },
  {
    id: '3',
    name: 'Analyst',
    description: 'Data analysis and reporting capabilities',
    permissions: ['view_analytics', 'export_data'],
    userCount: 12,
    isActive: true
  },
  {
    id: '4',
    name: 'Operator',
    description: 'Basic operational tasks and data entry',
    permissions: ['data_entry', 'view_products'],
    userCount: 25,
    isActive: true
  }
];

export function EnhancedSecurityManager() {
  const [securityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [roles, setRoles] = useState<AccessRole[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<AccessRole | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const { toast } = useToast();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Key className="h-4 w-4" />;
      case 'permission_change': return <Shield className="h-4 w-4" />;
      case 'data_access': return <Eye className="h-4 w-4" />;
      case 'failed_auth': return <AlertTriangle className="h-4 w-4" />;
      case 'api_usage': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const toggleRole = (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, isActive: !role.isActive } : role
    ));
    
    const role = roles.find(r => r.id === roleId);
    toast({
      title: `Role ${role?.isActive ? 'Disabled' : 'Enabled'}`,
      description: `${role?.name} role has been ${role?.isActive ? 'disabled' : 'enabled'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Management</h2>
          <p className="text-muted-foreground">
            Monitor security events and manage access controls
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Security Report
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              Across all devices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -60% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Rate Limit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">
              Current usage
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor authentication attempts, data access, and system changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.details}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.user} • {event.timestamp.toLocaleString()} • {event.ipAddress}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(event.riskLevel)}>
                      {event.riskLevel} risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Access Roles</h3>
              <p className="text-sm text-muted-foreground">
                Manage user roles and their permissions
              </p>
            </div>
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <CreateRoleForm onClose={() => setIsCreateRoleOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Switch
                      checked={role.isActive}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users:</span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Permissions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View and manage permissions across different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                  <div>Permission</div>
                  <div>Administrator</div>
                  <div>Manager</div>
                  <div>Analyst</div>
                  <div>Operator</div>
                </div>
                {[
                  'View Analytics',
                  'Bulk Operations',
                  'User Management',
                  'System Config',
                  'Export Data',
                  'Data Entry'
                ].map((permission) => (
                  <div key={permission} className="grid grid-cols-5 gap-4 items-center py-2 border-t">
                    <div className="text-sm">{permission}</div>
                    <div><Switch checked /></div>
                    <div><Switch checked={permission !== 'System Config'} /></div>
                    <div><Switch checked={['View Analytics', 'Export Data'].includes(permission)} /></div>
                    <div><Switch checked={['Data Entry'].includes(permission)} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all system activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Role Created', user: 'admin@company.com', time: '10 minutes ago', details: 'Created "Marketing" role' },
                  { action: 'Permission Updated', user: 'admin@company.com', time: '25 minutes ago', details: 'Added export permissions to Analyst role' },
                  { action: 'User Login', user: 'user@company.com', time: '1 hour ago', details: 'Successful login from 10.0.0.15' },
                  { action: 'Data Export', user: 'analyst@company.com', time: '2 hours ago', details: 'Exported product analytics (1,250 records)' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.user} • {log.details}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateRoleForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Role Created",
      description: "New role has been created successfully.",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="role-name">Role Name</Label>
          <Input id="role-name" placeholder="Enter role name" />
        </div>
        
        <div>
          <Label htmlFor="role-description">Description</Label>
          <Input id="role-description" placeholder="Enter role description" />
        </div>

        <div>
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              'View Analytics',
              'Bulk Operations', 
              'User Management',
              'System Config',
              'Export Data',
              'Data Entry'
            ].map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <input type="checkbox" id={permission} />
                <Label htmlFor={permission} className="text-sm">{permission}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Role
        </Button>
      </div>
    </form>
  );
}