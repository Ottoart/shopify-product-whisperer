-- Create analytics_events table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can insert their own analytics events') THEN
    CREATE POLICY "Users can insert their own analytics events" 
    ON public.analytics_events 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can view their own analytics events') THEN
    CREATE POLICY "Users can view their own analytics events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Admins can view all analytics events') THEN
    CREATE POLICY "Admins can view all analytics events" 
    ON public.analytics_events 
    FOR SELECT 
    USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Create search_queries table for search analytics
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for search_queries
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_queries' AND policyname = 'Users can insert their own search queries') THEN
    CREATE POLICY "Users can insert their own search queries" 
    ON public.search_queries 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_queries' AND policyname = 'Users can view their own search queries') THEN
    CREATE POLICY "Users can view their own search queries" 
    ON public.search_queries 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_queries' AND policyname = 'Admins can view all search queries') THEN
    CREATE POLICY "Admins can view all search queries" 
    ON public.search_queries 
    FOR SELECT 
    USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON public.search_queries(searched_at);

-- Update subscriptions table to include Stripe IDs for webhook handling
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create unique index on stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON public.subscriptions(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;