-- Phase 1: Enhanced Product Data & Filtering Infrastructure
-- Add missing product attributes for better filtering and user experience

-- Add brand, ratings, reviews, and enhanced filtering columns to store_products
ALTER TABLE public.store_products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_type TEXT,
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS delivery_time_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS warranty_info TEXT,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS size TEXT;

-- Create product_reviews table for review system
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  helpful_votes INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_reviews
CREATE POLICY "Anyone can view product reviews" 
ON public.product_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.product_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.product_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.product_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- Create shopping_carts table for cart functionality
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on shopping_carts
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopping_carts
CREATE POLICY "Users can manage their own shopping cart" 
ON public.shopping_carts FOR ALL 
USING (auth.uid() = user_id);

-- Create cart_items table for cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for cart_items
CREATE POLICY "Users can manage items in their cart" 
ON public.cart_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.shopping_carts 
  WHERE shopping_carts.id = cart_items.cart_id 
  AND shopping_carts.user_id = auth.uid()
));

-- Create wishlists table for favorites
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlists
CREATE POLICY "Users can manage their own wishlist" 
ON public.wishlists FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update product ratings
CREATE OR REPLACE FUNCTION public.update_product_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the store_products table with new rating info
  UPDATE public.store_products SET
    rating_average = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.product_reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update product ratings
CREATE TRIGGER update_product_ratings_on_insert
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_ratings();

CREATE TRIGGER update_product_ratings_on_update  
  AFTER UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_ratings();

CREATE TRIGGER update_product_ratings_on_delete
  AFTER DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_ratings();

-- Add updated_at trigger for new tables
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_carts_updated_at
  BEFORE UPDATE ON public.shopping_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();