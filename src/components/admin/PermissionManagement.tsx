import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, UserCheck, Clock } from "lucide-react";
import { PermissionType, UserPermission } from "@/hooks/usePermissions";

interface User {
  id: string;
  user_id: string;
  profiles?: {
    display_name: string;
  };
}

interface PermissionOverride {
  user_id: string;
  permission: PermissionType;
  resource_type: string;
  resource_id?: string;
  granted: boolean;
  expires_at?: string;
}

export const PermissionManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [newOverride, setNewOverride] = useState<PermissionOverride>({
    user_id: "",
    permission: "read" as PermissionType,
    resource_type: "",
    granted: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ["users-for-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as User[];
    }
  });

  // Fetch user permissions for selected user
  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ["user-permissions-admin", selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("user_id", selectedUser)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!selectedUser
  });

  // Create permission override
  const createOverrideMutation = useMutation({
    mutationFn: async (override: PermissionOverride) => {
      const { data, error } = await supabase
        .from("user_permissions")
        .insert([{
          ...override,
          granted_by: (await supabase.auth.getUser()).data.user?.id,
          expires_at: override.expires_at || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-admin"] });
      setIsCreateDialogOpen(false);
      setNewOverride({
        user_id: "",
        permission: "read" as PermissionType,
        resource_type: "",
        granted: true
      });
      toast({ title: "Permission override created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating permission override",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle permission
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ id, granted }: { id: string; granted: boolean }) => {
      const { data, error } = await supabase
        .from("user_permissions")
        .update({ granted })
        .eq("id", id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-admin"] });
      toast({ title: "Permission updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateOverride = () => {
    if (!selectedUser) {
      toast({
        title: "Please select a user first",
        variant: "destructive"
      });
      return;
    }
    createOverrideMutation.mutate({ ...newOverride, user_id: selectedUser });
  };

  const getPermissionBadgeVariant = (permission: PermissionType) => {
    switch (permission) {
      case 'admin':
        return 'destructive';
      case 'delete':
        return 'destructive';
      case 'write':
        return 'default';
      case 'read':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
          <CardDescription>
            Manage individual user permission overrides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to manage permissions" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.user_id}>
                      {user.profiles?.display_name || `User ${user.user_id.substring(0, 8)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Permission Overrides</h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Override
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Permission Override</DialogTitle>
                      <DialogDescription>
                        Grant or revoke specific permissions for this user
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Permission</Label>
                        <Select
                          value={newOverride.permission}
                          onValueChange={(value) => setNewOverride(prev => ({ 
                            ...prev, 
                            permission: value as PermissionType 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="write">Write</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="billing_view">Billing View</SelectItem>
                            <SelectItem value="billing_manage">Billing Manage</SelectItem>
                            <SelectItem value="user_manage">User Manage</SelectItem>
                            <SelectItem value="company_manage">Company Manage</SelectItem>
                            <SelectItem value="system_logs">System Logs</SelectItem>
                            <SelectItem value="analytics_view">Analytics View</SelectItem>
                            <SelectItem value="inventory_manage">Inventory Manage</SelectItem>
                            <SelectItem value="orders_manage">Orders Manage</SelectItem>
                            <SelectItem value="shipping_manage">Shipping Manage</SelectItem>
                            <SelectItem value="repricing_manage">Repricing Manage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Resource Type</Label>
                        <Input
                          value={newOverride.resource_type}
                          onChange={(e) => setNewOverride(prev => ({ 
                            ...prev, 
                            resource_type: e.target.value 
                          }))}
                          placeholder="e.g., inventory, orders, billing"
                        />
                      </div>
                      <div>
                        <Label>Resource ID (Optional)</Label>
                        <Input
                          value={newOverride.resource_id || ""}
                          onChange={(e) => setNewOverride(prev => ({ 
                            ...prev, 
                            resource_id: e.target.value || undefined 
                          }))}
                          placeholder="Specific resource ID"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newOverride.granted}
                          onCheckedChange={(checked) => setNewOverride(prev => ({ 
                            ...prev, 
                            granted: checked 
                          }))}
                        />
                        <Label>Grant Permission</Label>
                      </div>
                      <div>
                        <Label>Expires At (Optional)</Label>
                        <Input
                          type="datetime-local"
                          value={newOverride.expires_at || ""}
                          onChange={(e) => setNewOverride(prev => ({ 
                            ...prev, 
                            expires_at: e.target.value || undefined 
                          }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateOverride}
                        disabled={createOverrideMutation.isPending || !newOverride.resource_type}
                      >
                        {createOverrideMutation.isPending ? "Creating..." : "Create Override"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Current Permission Overrides</CardTitle>
            <CardDescription>
              Individual permissions granted or revoked for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading permissions...</div>
            ) : userPermissions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No permission overrides found for this user
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Resource ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPermissions?.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Badge variant={getPermissionBadgeVariant(permission.permission)}>
                          {permission.permission}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                          {permission.resource_type}
                        </code>
                      </TableCell>
                      <TableCell>
                        {permission.resource_id ? (
                          <code className="text-sm bg-muted px-1 py-0.5 rounded">
                            {permission.resource_id.substring(0, 8)}...
                          </code>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {permission.granted ? (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <Shield className="w-4 h-4 text-red-500" />
                          )}
                          <span>{permission.granted ? "Granted" : "Revoked"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {permission.expires_at ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(permission.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : "Never"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={permission.granted}
                          onCheckedChange={(checked) => 
                            togglePermissionMutation.mutate({
                              id: permission.id,
                              granted: checked
                            })
                          }
                          disabled={togglePermissionMutation.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};