-- Transfer ownership of Shopi store and products to current test user
-- Current owner: 3a393edd-271d-4d32-b18d-e10fce7ee248 (ottman1@gmail.com)
-- New owner: fccf8bed-fc77-463b-aa42-633d69d7e6ad (developerweb6@yopmail.com)

-- Update store configuration ownership
UPDATE store_configurations 
SET user_id = 'fccf8bed-fc77-463b-aa42-633d69d7e6ad'
WHERE id = '1fefc8fd-4dc6-4c58-8899-ff259044a757' 
  AND store_name = 'Shopi' 
  AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';

-- Update all Shopi products ownership (250 products)
UPDATE products 
SET user_id = 'fccf8bed-fc77-463b-aa42-633d69d7e6ad'
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248'
  AND store_name = 'Shopi';

-- Log the migration for audit purposes
INSERT INTO audit_logs (event_type, user_id, details)
VALUES (
  'store_ownership_transfer',
  'fccf8bed-fc77-463b-aa42-633d69d7e6ad',
  jsonb_build_object(
    'store_name', 'Shopi',
    'store_id', '1fefc8fd-4dc6-4c58-8899-ff259044a757',
    'previous_owner', '3a393edd-271d-4d32-b18d-e10fce7ee248',
    'new_owner', 'fccf8bed-fc77-463b-aa42-633d69d7e6ad',
    'migration_type', 'multi_tenant_fix'
  )
);