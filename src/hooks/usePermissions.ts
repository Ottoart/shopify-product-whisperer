import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

// Permission types from the database enum
export type PermissionType = 
  | 'read'
  | 'write' 
  | 'delete'
  | 'admin'
  | 'billing_view'
  | 'billing_manage'
  | 'user_manage'
  | 'company_manage'
  | 'system_logs'
  | 'analytics_view'
  | 'inventory_manage'
  | 'orders_manage'
  | 'shipping_manage'
  | 'repricing_manage';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'master_admin' | 'admin' | 'manager' | 'user';
  is_active: boolean;
  permissions: any;
}

export interface RolePermission {
  id: string;
  role: string;
  permission: PermissionType;
  resource_type: string;
  conditions: any;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission: PermissionType;
  resource_type: string;
  resource_id?: string;
  granted: boolean;
  expires_at?: string;
  granted_by: string;
}

/**
 * Hook to check if the current user has a specific permission
 */
export const usePermission = (permission: PermissionType, resourceType: string, resourceId?: string) => {
  const session = useSession();
  
  return useQuery({
    queryKey: ['user-permission', permission, resourceType, resourceId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase.rpc('has_permission', {
        _user_id: session.user.id,
        _permission: permission,
        _resource_type: resourceType,
        _resource_id: resourceId || null
      });
      
      if (error) {
        console.error('Permission check failed:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook to get all permissions for the current user
 */
export const useUserPermissions = () => {
  const session = useSession();
  
  return useQuery({
    queryKey: ['user-permissions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('granted', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      
      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!session?.user?.id,
  });
};

/**
 * Hook to get the current user's role
 */
export const useUserRole = () => {
  const session = useSession();
  
  return useQuery({
    queryKey: ['user-role', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        // User might not be an admin, that's ok
        return { role: 'user' as const };
      }
      
      return data as UserRole;
    },
    enabled: !!session?.user?.id,
  });
};

/**
 * Hook to get all role permissions (admin only)
 */
export const useRolePermissions = () => {
  const session = useSession();
  
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true })
        .order('resource_type', { ascending: true });
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!session?.user?.id,
  });
};

/**
 * Hook to check if user is admin (any level)
 */
export const useIsAdmin = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role && ['master_admin', 'admin', 'manager'].includes(userRole.role);
};

/**
 * Hook to check if user is master admin
 */
export const useIsMasterAdmin = () => {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'master_admin';
};

/**
 * Hook to check if any master admin exists in the system
 */
export const useMasterAdminExists = () => {
  return useQuery({
    queryKey: ['master-admin-exists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('role', 'master_admin')
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        console.error('Error checking master admin existence:', error);
        return false;
      }
      
      return data && data.length > 0;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Multiple permission check helper
 */
export const usePermissions = (permissions: Array<{ permission: PermissionType, resourceType: string, resourceId?: string }>) => {
  const session = useSession();
  
  return useQuery({
    queryKey: ['multiple-permissions', permissions, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      
      const results: Record<string, boolean> = {};
      
      // Check each permission
      for (const perm of permissions) {
        const key = `${perm.permission}:${perm.resourceType}${perm.resourceId ? `:${perm.resourceId}` : ''}`;
        
        try {
          const { data, error } = await supabase.rpc('has_permission', {
            _user_id: session.user.id,
            _permission: perm.permission,
            _resource_type: perm.resourceType,
            _resource_id: perm.resourceId || null
          });
          
          results[key] = error ? false : (data as boolean);
        } catch (error) {
          console.error(`Permission check failed for ${key}:`, error);
          results[key] = false;
        }
      }
      
      return results;
    },
    enabled: !!session?.user?.id && permissions.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};