-- Create marketplace configuration from existing eBay store configuration
INSERT INTO public.marketplace_configurations (
  user_id,
  platform, 
  external_user_id,
  access_token,
  refresh_token,
  store_name,
  is_active,
  metadata
)
SELECT 
  user_id,
  'ebay' as platform,
  domain as external_user_id,
  (access_token::jsonb->>'access_token') as access_token,
  (access_token::jsonb->>'refresh_token') as refresh_token,
  store_name,
  is_active,
  jsonb_build_object(
    'ebay_user_id', access_token::jsonb->>'ebay_user_id',
    'ebay_username', access_token::jsonb->>'ebay_username',
    'connected_at', access_token::jsonb->>'connected_at',
    'token_type', access_token::jsonb->>'token_type',
    'scope', access_token::jsonb->>'scope'
  ) as metadata
FROM store_configurations 
WHERE platform = 'ebay' 
AND NOT EXISTS (
  SELECT 1 FROM marketplace_configurations 
  WHERE platform = 'ebay' 
  AND user_id = store_configurations.user_id
);