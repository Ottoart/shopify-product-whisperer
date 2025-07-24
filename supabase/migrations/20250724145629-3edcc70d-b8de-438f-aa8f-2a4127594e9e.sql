-- Remove the existing hardcoded admin user
DELETE FROM admin_users WHERE user_id = 'c6a235f6-ac10-4afa-8909-c0cf441817da';

-- Add ottman1@gmail.com as the master admin
INSERT INTO admin_users (
  user_id,
  role,
  permissions,
  is_active,
  created_by
) VALUES (
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  'master_admin',
  '{
    "can_create_admins": true,
    "can_manage_users": true,
    "can_manage_companies": true,
    "can_manage_billing": true,
    "can_view_logs": true,
    "can_manage_feature_flags": true
  }',
  true,
  '3a393edd-271d-4d32-b18d-e10fce7ee248'
);