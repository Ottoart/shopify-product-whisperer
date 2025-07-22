import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Building2, FileText, BarChart3, Package, ShoppingCart, Truck, DollarSign } from "lucide-react";
import { PermissionType, RolePermission } from "@/hooks/usePermissions";

const getResourceIcon = (resourceType: string) => {
  switch (resourceType) {
    case 'users':
      return <Users className="w-4 h-4" />;
    case 'companies':
      return <Building2 className="w-4 h-4" />;
    case 'billing':
      return <DollarSign className="w-4 h-4" />;
    case 'logs':
      return <FileText className="w-4 h-4" />;
    case 'analytics':
      return <BarChart3 className="w-4 h-4" />;
    case 'inventory':
      return <Package className="w-4 h-4" />;
    case 'orders':
      return <ShoppingCart className="w-4 h-4" />;
    case 'shipping':
      return <Truck className="w-4 h-4" />;
    case 'system':
      return <Shield className="w-4 h-4" />;
    default:
      return <Shield className="w-4 h-4" />;
  }
};

const getPermissionBadgeVariant = (permission: PermissionType) => {
  switch (permission) {
    case 'admin':
      return 'destructive';
    case 'delete':
      return 'destructive';
    case 'write':
    case 'user_manage':
    case 'company_manage':
    case 'billing_manage':
      return 'default';
    case 'read':
    case 'billing_view':
    case 'analytics_view':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'master_admin':
      return 'destructive';
    case 'admin':
      return 'default';
    case 'manager':
      return 'secondary';
    case 'user':
      return 'outline';
    default:
      return 'outline';
  }
};

export const RolePermissionsOverview = () => {
  const { data: rolePermissions, isLoading } = useQuery({
    queryKey: ["role-permissions-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .order("role", { ascending: true })
        .order("resource_type", { ascending: true });
      
      if (error) throw error;
      return data as RolePermission[];
    }
  });

  // Group permissions by role
  const groupedPermissions = rolePermissions?.reduce((acc, permission) => {
    if (!acc[permission.role]) {
      acc[permission.role] = [];
    }
    acc[permission.role].push(permission);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading role permissions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Permissions Overview</CardTitle>
          <CardDescription>
            View the permission matrix for all user roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolePermissions?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(permission.role)}>
                      {permission.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPermissionBadgeVariant(permission.permission)}>
                      {permission.permission.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(permission.resource_type)}
                      <code className="text-sm bg-muted px-1 py-0.5 rounded">
                        {permission.resource_type}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {permission.conditions && Object.keys(permission.conditions).length > 0 ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary hover:underline">
                          View Conditions
                        </summary>
                        <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto max-h-20">
                          {JSON.stringify(permission.conditions, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      System
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedPermissions || {}).map(([role, permissions]) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{role.replace('_', ' ')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {permissions.length} permissions
                </div>
                <div className="flex flex-wrap gap-1">
                  {permissions.slice(0, 3).map((permission) => (
                    <Badge
                      key={permission.id}
                      variant={getPermissionBadgeVariant(permission.permission)}
                      className="text-xs"
                    >
                      {permission.permission.replace('_', ' ')}
                    </Badge>
                  ))}
                  {permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};