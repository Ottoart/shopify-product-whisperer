-- Create analytics_events table for tracking user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics events
CREATE POLICY "Users can insert their own events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create product_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'view',
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Create policies for product views
CREATE POLICY "Users can insert their own product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own product views" 
ON public.product_views 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);