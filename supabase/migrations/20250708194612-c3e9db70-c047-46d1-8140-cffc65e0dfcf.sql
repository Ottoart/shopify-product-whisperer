-- Add unique constraint for handle and user_id combination
-- This ensures each user can only have one product with a specific handle
ALTER TABLE public.products 
ADD CONSTRAINT products_handle_user_id_unique UNIQUE (handle, user_id);