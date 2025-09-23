-- Phase 1C: Create missing shopping_carts table with proper syntax

-- Create shopping_carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

-- Create policy (drop first if exists to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can manage their own shopping carts" ON public.shopping_carts
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_shopping_carts_updated_at ON public.shopping_carts;
CREATE TRIGGER update_shopping_carts_updated_at
  BEFORE UPDATE ON public.shopping_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();