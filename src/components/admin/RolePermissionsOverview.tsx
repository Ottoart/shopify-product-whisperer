import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, UserCheck, User } from "lucide-react";

const roles = [
  {
    name: "master_admin",
    displayName: "Master Admin",
    icon: Crown,
    description: "Full system access with all administrative privileges",
    permissions: ["All Permissions", "System Configuration", "User Management", "Security Settings"],
    color: "default"
  },
  {
    name: "admin",
    displayName: "Admin",
    icon: Shield,
    description: "Administrative access with most management capabilities",
    permissions: ["User Management", "Data Management", "Reports & Analytics", "Limited System Settings"],
    color: "secondary"
  },
  {
    name: "manager",
    displayName: "Manager",
    icon: UserCheck,
    description: "Supervisory access with read/write permissions for operational data",
    permissions: ["User Viewing/Editing", "Data Read/Write", "Report Generation", "Analytics Access"],
    color: "outline"
  },
  {
    name: "user",
    displayName: "User",
    icon: User,
    description: "Basic access with limited read permissions",
    permissions: ["Data Reading", "Profile Management"],
    color: "outline"
  }
];

const permissionMatrix = [
  { permission: "User Creation", master_admin: true, admin: true, manager: false, user: false },
  { permission: "User Management", master_admin: true, admin: true, manager: true, user: false },
  { permission: "System Configuration", master_admin: true, admin: false, manager: false, user: false },
  { permission: "Data Management", master_admin: true, admin: true, manager: true, user: false },
  { permission: "Report Generation", master_admin: true, admin: true, manager: true, user: false },
  { permission: "Analytics Access", master_admin: true, admin: true, manager: true, user: false },
  { permission: "Audit Logs", master_admin: true, admin: true, manager: false, user: false },
  { permission: "Billing Management", master_admin: true, admin: true, manager: false, user: false },
  { permission: "Security Settings", master_admin: true, admin: false, manager: false, user: false },
];

export const RolePermissionsOverview = () => {
  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
    ) : (
      <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <role.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{role.displayName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
              <div className="space-y-1">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant={role.color as any} className="text-xs mr-1 mb-1">
                    {permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Detailed view of permissions assigned to each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead className="text-center">Master Admin</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionMatrix.map((row) => (
                <TableRow key={row.permission}>
                  <TableCell className="font-medium">{row.permission}</TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(row.master_admin)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(row.admin)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(row.manager)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPermissionIcon(row.user)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};