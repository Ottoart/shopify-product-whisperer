-- Add advanced_settings column to sync_settings table for configurable sync parameters
ALTER TABLE sync_settings 
ADD COLUMN advanced_settings JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the new column
COMMENT ON COLUMN sync_settings.advanced_settings IS 'Advanced sync configuration including batch size, rate limits, and reliability settings';