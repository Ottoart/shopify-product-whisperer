-- Create sync settings table for user preferences
CREATE TABLE public.sync_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  sync_active_only BOOLEAN NOT NULL DEFAULT true,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_frequency_hours INTEGER DEFAULT 24,
  last_preference_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.sync_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own sync settings" 
ON public.sync_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sync_settings_updated_at
BEFORE UPDATE ON public.sync_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add columns to marketplace_sync_status for better tracking
ALTER TABLE public.marketplace_sync_status 
ADD COLUMN IF NOT EXISTS total_products_found INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_products_synced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inactive_products_skipped INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sync_settings JSONB DEFAULT '{}';

-- Add token expiration tracking to marketplace_configurations
ALTER TABLE public.marketplace_configurations 
ADD COLUMN IF NOT EXISTS token_refresh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_token_refresh TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS token_expires_warning_sent BOOLEAN DEFAULT false;