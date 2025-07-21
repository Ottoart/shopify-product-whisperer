-- Fix RLS policies for INSERT operations to include proper user_id checks

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can create their own store configs" ON public.store_configurations;
DROP POLICY IF EXISTS "Users can create their own marketplace configurations" ON public.marketplace_configurations;

-- Create proper INSERT policies with user_id validation
CREATE POLICY "Users can create their own store configs" 
ON public.store_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own marketplace configurations" 
ON public.marketplace_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);