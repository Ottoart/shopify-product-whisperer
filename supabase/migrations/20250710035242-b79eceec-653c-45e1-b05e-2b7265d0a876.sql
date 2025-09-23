-- Create table to store Shopify analytics data
CREATE TABLE public.shopify_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analytics_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shopify_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analytics" 
ON public.shopify_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.shopify_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.shopify_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create unique constraint to ensure one analytics record per user
ALTER TABLE public.shopify_analytics 
ADD CONSTRAINT unique_user_analytics UNIQUE (user_id);

-- Create index for better performance
CREATE INDEX idx_shopify_analytics_user_id ON public.shopify_analytics(user_id);
CREATE INDEX idx_shopify_analytics_last_updated ON public.shopify_analytics(last_updated);