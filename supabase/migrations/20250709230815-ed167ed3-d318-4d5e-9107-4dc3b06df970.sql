-- Add category column to products table for Shopify standard product taxonomy
ALTER TABLE public.products 
ADD COLUMN category TEXT;