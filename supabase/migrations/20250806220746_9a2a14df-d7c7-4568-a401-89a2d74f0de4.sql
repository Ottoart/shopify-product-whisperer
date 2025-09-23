-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping carts table (if not exists)
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create cart items table (if not exists)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Create recently viewed products table
CREATE TABLE public.recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_reviews
CREATE POLICY "Anyone can view reviews" ON public.product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for products they bought" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shopping_carts
CREATE POLICY "Users can manage their own shopping cart" ON public.shopping_carts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for cart_items
CREATE POLICY "Users can manage items in their cart" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shopping_carts 
      WHERE shopping_carts.id = cart_items.cart_id 
      AND shopping_carts.user_id = auth.uid()
    )
  );

-- Create RLS policies for recently_viewed
CREATE POLICY "Users can manage their own recently viewed" ON public.recently_viewed
  FOR ALL USING (auth.uid() = user_id);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for automatic rating updates
CREATE TRIGGER update_product_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_ratings();

-- Create function to manage recently viewed (limit to 20 items per user)
CREATE OR REPLACE FUNCTION public.manage_recently_viewed()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the viewed timestamp
  INSERT INTO public.recently_viewed (user_id, product_id, viewed_at)
  VALUES (NEW.user_id, NEW.product_id, NEW.viewed_at)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET viewed_at = NEW.viewed_at;
  
  -- Keep only the most recent 20 items per user
  DELETE FROM public.recently_viewed
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.recently_viewed
    WHERE user_id = NEW.user_id
    ORDER BY viewed_at DESC
    LIMIT 20
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for managing recently viewed
CREATE TRIGGER manage_recently_viewed_trigger
  BEFORE INSERT ON public.recently_viewed
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_recently_viewed();

-- Create indexes for better performance
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at DESC);