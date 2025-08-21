-- Drop the restrictive platform check constraint to allow any marketplace platform
ALTER TABLE public.marketplace_configurations 
DROP CONSTRAINT IF EXISTS marketplace_configurations_platform_check;