-- Create marketplace_configurations table for eBay and other marketplace integrations
CREATE TABLE public.marketplace_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ebay', 'amazon', 'walmart', 'etsy')),
  external_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  store_name TEXT,
  store_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deletion_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, external_user_id)
);

-- Create webhook_events table for logging marketplace webhooks
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  notification_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_configurations
CREATE POLICY "Users can view their own marketplace configurations" 
ON public.marketplace_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own marketplace configurations" 
ON public.marketplace_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace configurations" 
ON public.marketplace_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace configurations" 
ON public.marketplace_configurations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for webhook_events (read-only for users, service role can write)
CREATE POLICY "Service role can manage webhook events" 
ON public.webhook_events 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_marketplace_configurations_updated_at
BEFORE UPDATE ON public.marketplace_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_marketplace_configurations_user_platform ON public.marketplace_configurations(user_id, platform);
CREATE INDEX idx_marketplace_configurations_external_user ON public.marketplace_configurations(external_user_id);
CREATE INDEX idx_webhook_events_platform_type ON public.webhook_events(platform, event_type);
CREATE INDEX idx_webhook_events_notification_id ON public.webhook_events(notification_id);