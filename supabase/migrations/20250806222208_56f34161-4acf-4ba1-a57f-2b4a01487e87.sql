-- Create product_views table for popularity tracking
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id UUID NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'click', 'cart_add', 'purchase'
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own product views" 
ON public.product_views 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create user_interactions table for comprehensive analytics
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  interaction_type TEXT NOT NULL, -- 'search', 'filter', 'sort', 'banner_click', etc.
  target_id UUID, -- product_id, banner_id, etc.
  data JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert interactions" 
ON public.user_interactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own interactions" 
ON public.user_interactions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create promotional_banners table
CREATE TABLE public.promotional_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  banner_type TEXT NOT NULL DEFAULT 'hero', -- 'hero', 'strip', 'sidebar'
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  target_audience JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active banners" 
ON public.promotional_banners 
FOR SELECT 
USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage banners" 
ON public.promotional_banners 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create search_queries table for analytics and suggestions
CREATE TABLE public.search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert search queries" 
ON public.search_queries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own search queries" 
ON public.search_queries 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Add indexes for performance
CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX idx_product_views_created_at ON public.product_views(created_at);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX idx_promotional_banners_active ON public.promotional_banners(is_active, starts_at, expires_at);
CREATE INDEX idx_search_queries_query ON public.search_queries(query);

-- Add popularity columns to store_products table
ALTER TABLE public.store_products 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;

-- Create function to update product popularity
CREATE OR REPLACE FUNCTION public.update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update view count and popularity score
  UPDATE public.store_products 
  SET 
    view_count = (
      SELECT COUNT(*) 
      FROM public.product_views 
      WHERE product_id = NEW.product_id AND view_type = 'view'
    ),
    popularity_score = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE view_type = 'view')) * 1 +
        (COUNT(*) FILTER (WHERE view_type = 'cart_add')) * 3 +
        (COUNT(*) FILTER (WHERE view_type = 'purchase')) * 10,
        0
      )
      FROM public.product_views 
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update popularity on new views
CREATE TRIGGER update_product_popularity_trigger
AFTER INSERT ON public.product_views
FOR EACH ROW
EXECUTE FUNCTION public.update_product_popularity();

-- Create trigger for updated_at on promotional_banners
CREATE TRIGGER update_promotional_banners_updated_at
BEFORE UPDATE ON public.promotional_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();