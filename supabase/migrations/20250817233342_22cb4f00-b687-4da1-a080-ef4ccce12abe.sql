-- Migrate carrier configurations from previous Shopi store owner to current user
-- This fixes the missing API keys issue by transferring the existing UPS and Canada Post configurations

-- Transfer UPS carrier configuration with all API credentials
UPDATE carrier_configurations 
SET user_id = 'fccf8bed-fc77-463b-aa42-633d69d7e6ad'
WHERE carrier_name = 'UPS' 
  AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248'
  AND is_active = true;

-- Transfer Canada Post carrier configuration  
UPDATE carrier_configurations 
SET user_id = 'fccf8bed-fc77-463b-aa42-633d69d7e6ad'
WHERE carrier_name = 'Canada Post' 
  AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248'
  AND is_active = true;

-- Log the carrier configuration migration
INSERT INTO audit_logs (event_type, user_id, details)
VALUES (
  'carrier_configs_migration',
  'fccf8bed-fc77-463b-aa42-633d69d7e6ad',
  jsonb_build_object(
    'previous_owner', '3a393edd-271d-4d32-b18d-e10fce7ee248',
    'new_owner', 'fccf8bed-fc77-463b-aa42-633d69d7e6ad',
    'carriers_migrated', ARRAY['UPS', 'Canada Post'],
    'migration_reason', 'store_ownership_transfer'
  )
);