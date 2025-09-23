-- Phase 1B: Fix trigger conflicts and add missing tables

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_shopify_orders_updated_at ON public.shopify_orders;
DROP TRIGGER IF EXISTS update_shopify_customers_updated_at ON public.shopify_customers;
DROP TRIGGER IF EXISTS update_shopify_inventory_updated_at ON public.shopify_inventory;

-- Create any missing tables that might not exist
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their own shopping carts" ON public.shopping_carts
  FOR ALL USING (auth.uid() = user_id);

-- Add shopping cart trigger
CREATE TRIGGER update_shopping_carts_updated_at
  BEFORE UPDATE ON public.shopping_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate the shopify triggers properly
CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_customers_updated_at
  BEFORE UPDATE ON public.shopify_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_inventory_updated_at
  BEFORE UPDATE ON public.shopify_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();