-- Remove the problematic unique constraint that prevents users from having multiple stores
ALTER TABLE public.store_configurations 
DROP CONSTRAINT IF EXISTS store_configurations_user_id_domain_key;

-- Allow users to have multiple stores by making domain not part of a unique constraint with user_id