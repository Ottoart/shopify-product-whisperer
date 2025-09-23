-- Update the eBay marketplace configuration with the correct external_user_id
UPDATE public.marketplace_configurations 
SET external_user_id = 'ottman1',
    updated_at = now()
WHERE platform = 'ebay' 
AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';