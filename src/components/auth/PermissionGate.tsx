import React from 'react';
import { usePermission, PermissionType } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission: PermissionType;
  resourceType: string;
  resourceId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  resourceType,
  resourceId,
  children,
  fallback = null,
  loading = null
}) => {
  const { data: hasPermission, isLoading } = usePermission(permission, resourceType, resourceId);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleGateProps {
  allowedRoles: Array<'master_admin' | 'admin' | 'manager' | 'user'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  children,
  fallback = null,
  loading = null
}) => {
  const { data: hasPermission, isLoading } = usePermission('admin', 'system');
  
  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Component that only renders for admin users
 */
export const AdminGate: React.FC<AdminGateProps> = ({
  children,
  fallback = null,
  loading = null
}) => {
  return (
    <PermissionGate
      permission="admin"
      resourceType="system"
      fallback={fallback}
      loading={loading}
    >
      {children}
    </PermissionGate>
  );
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionType,
  resourceType: string,
  resourceId?: string
) => {
  return (props: P) => (
    <PermissionGate permission={permission} resourceType={resourceType} resourceId={resourceId}>
      <Component {...props} />
    </PermissionGate>
  );
};

/**
 * Higher-order component for admin-only components
 */
export const withAdminAccess = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AdminGate>
      <Component {...props} />
    </AdminGate>
  );
};