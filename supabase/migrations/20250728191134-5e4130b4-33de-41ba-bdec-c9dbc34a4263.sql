-- Add RLS policies for admin access to user data

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to view all store configurations
CREATE POLICY "Admins can view all store configurations" 
ON public.store_configurations 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to view all inventory submissions
CREATE POLICY "Admins can view all inventory submissions" 
ON public.inventory_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to view all submission invoices
CREATE POLICY "Admins can view all submission invoices" 
ON public.submission_invoices 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to view all submission items
CREATE POLICY "Admins can view all submission items" 
ON public.submission_items 
FOR SELECT 
USING (is_admin(auth.uid()));