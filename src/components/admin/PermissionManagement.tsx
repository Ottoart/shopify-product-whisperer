import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Settings, Database, FileText } from "lucide-react";

const permissions = [
  {
    category: "User Management",
    icon: Users,
    permissions: [
      { name: "user.create", description: "Create new users" },
      { name: "user.read", description: "View user information" },
      { name: "user.update", description: "Update user profiles" },
      { name: "user.delete", description: "Delete user accounts" },
    ]
  },
  {
    category: "System Administration",
    icon: Settings,
    permissions: [
      { name: "admin.create", description: "Create admin accounts" },
      { name: "admin.read", description: "View admin information" },
      { name: "admin.update", description: "Update admin settings" },
      { name: "admin.delete", description: "Remove admin privileges" },
    ]
  },
  {
    category: "Data Management",
    icon: Database,
    permissions: [
      { name: "data.create", description: "Create new records" },
      { name: "data.read", description: "Access data records" },
      { name: "data.update", description: "Modify existing data" },
      { name: "data.delete", description: "Delete data records" },
    ]
  },
  {
    category: "Reports & Analytics",
    icon: FileText,
    permissions: [
      { name: "reports.read", description: "View reports" },
      { name: "reports.create", description: "Generate reports" },
      { name: "analytics.read", description: "Access analytics" },
      { name: "logs.read", description: "View system logs" },
    ]
  }
];

const rolePermissions = {
  master_admin: ["*"], // All permissions
  admin: [
    "user.create", "user.read", "user.update", "user.delete",
    "admin.read", "admin.update",
    "data.create", "data.read", "data.update", "data.delete",
    "reports.read", "reports.create", "analytics.read", "logs.read"
  ],
  manager: [
    "user.read", "user.update",
    "data.read", "data.update",
    "reports.read", "analytics.read"
  ],
  user: [
    "data.read"
  ]
};

export const PermissionManagement = () => {
  const hasPermission = (role: string, permission: string) => {
    const perms = rolePermissions[role as keyof typeof rolePermissions] || [];
    return perms.includes("*") || perms.includes(permission);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permission Management</span>
          </CardTitle>
          <CardDescription>
            Overview of system permissions and role-based access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {permissions.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <category.icon className="h-4 w-4" />
                    <span>{category.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.permissions.map((permission) => (
                      <div key={permission.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {Object.keys(rolePermissions).map((role) => (
                            <Badge 
                              key={role}
                              variant={hasPermission(role, permission.name) ? "default" : "outline"}
                              className="text-xs"
                            >
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
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