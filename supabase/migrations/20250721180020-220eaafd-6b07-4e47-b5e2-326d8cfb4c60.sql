-- Remove duplicate eBay store configurations
-- Keep the most recent one and delete the older duplicate
DELETE FROM public.store_configurations 
WHERE platform = 'ebay' 
AND store_name = 'eBay Store' 
AND id = '04498c7c-2c55-493c-8a57-b0ae67997474';