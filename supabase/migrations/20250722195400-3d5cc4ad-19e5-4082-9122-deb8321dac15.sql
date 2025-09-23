-- Create permissions enum
CREATE TYPE permission_type AS ENUM (
  'read',
  'write',
  'delete',
  'admin',
  'billing_view',
  'billing_manage',
  'user_manage',
  'company_manage',
  'system_logs',
  'analytics_view',
  'inventory_manage',
  'orders_manage',
  'shipping_manage',
  'repricing_manage'
);

-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission permission_type NOT NULL,
  resource_type TEXT NOT NULL, -- e.g., 'users', 'companies', 'billing', 'inventory'
  conditions JSONB DEFAULT '{}', -- Additional conditions for the permission
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission, resource_type)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing role permissions (admins only)
CREATE POLICY "Admins can view role permissions"
ON public.role_permissions
FOR SELECT
USING (is_admin(auth.uid()));

-- Create policy for managing role permissions (master admins only)
CREATE POLICY "Master admins can manage role permissions"
ON public.role_permissions
FOR ALL
USING (has_admin_role(auth.uid(), 'master_admin'::user_role));

-- Create user permissions table for individual user overrides
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission permission_type NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID, -- Specific resource ID (optional for global permissions)
  granted BOOLEAN DEFAULT true, -- true = grant, false = revoke
  granted_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, permission, resource_type, resource_id)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user permissions"
ON public.user_permissions
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage user permissions"
ON public.user_permissions
FOR ALL
USING (is_admin(auth.uid()));

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission permission_type, _resource_type TEXT, _resource_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role_val user_role;
  has_role_permission BOOLEAN := false;
  has_user_permission BOOLEAN := false;
  user_permission_granted BOOLEAN;
BEGIN
  -- Get user's role from admin_users table
  SELECT role INTO user_role_val
  FROM public.admin_users
  WHERE user_id = _user_id AND is_active = true;
  
  -- If no admin role found, default to 'user'
  IF user_role_val IS NULL THEN
    user_role_val := 'user'::user_role;
  END IF;
  
  -- Check role-based permissions
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions
    WHERE role = user_role_val
    AND permission = _permission
    AND resource_type = _resource_type
  ) INTO has_role_permission;
  
  -- Check user-specific permissions (overrides)
  SELECT granted INTO user_permission_granted
  FROM public.user_permissions
  WHERE user_id = _user_id
  AND permission = _permission
  AND resource_type = _resource_type
  AND (resource_id IS NULL OR resource_id = _resource_id)
  AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- User permission overrides role permission
  IF user_permission_granted IS NOT NULL THEN
    RETURN user_permission_granted;
  END IF;
  
  -- Fall back to role permission
  RETURN has_role_permission;
END;
$$;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission, resource_type) VALUES
-- Master Admin permissions (full access)
('master_admin', 'admin', 'system'),
('master_admin', 'user_manage', 'users'),
('master_admin', 'company_manage', 'companies'),
('master_admin', 'billing_manage', 'billing'),
('master_admin', 'system_logs', 'logs'),
('master_admin', 'analytics_view', 'analytics'),
('master_admin', 'read', 'all'),
('master_admin', 'write', 'all'),
('master_admin', 'delete', 'all'),

-- Admin permissions (most access except user management)
('admin', 'company_manage', 'companies'),
('admin', 'billing_view', 'billing'),
('admin', 'system_logs', 'logs'),
('admin', 'analytics_view', 'analytics'),
('admin', 'inventory_manage', 'inventory'),
('admin', 'orders_manage', 'orders'),
('admin', 'shipping_manage', 'shipping'),
('admin', 'repricing_manage', 'repricing'),
('admin', 'read', 'all'),
('admin', 'write', 'all'),

-- Manager permissions (operational access)
('manager', 'billing_view', 'billing'),
('manager', 'analytics_view', 'analytics'),
('manager', 'inventory_manage', 'inventory'),
('manager', 'orders_manage', 'orders'),
('manager', 'shipping_manage', 'shipping'),
('manager', 'repricing_manage', 'repricing'),
('manager', 'read', 'all'),
('manager', 'write', 'inventory'),
('manager', 'write', 'orders'),
('manager', 'write', 'shipping'),

-- User permissions (basic access)
('user', 'read', 'inventory'),
('user', 'read', 'orders'),
('user', 'read', 'shipping'),
('user', 'read', 'analytics'),
('user', 'write', 'inventory'),
('user', 'write', 'orders');

-- Create trigger for updating updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();