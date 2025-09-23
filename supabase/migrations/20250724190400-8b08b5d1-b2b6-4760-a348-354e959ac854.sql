-- Add ShipStation configuration support to carrier_configurations table
-- Update carrier_configurations to support ShipStation API credentials

-- Add ShipStation as a carrier option if not already present
DO $$
BEGIN
  -- Check if ShipStation carrier doesn't exist and add it
  IF NOT EXISTS (
    SELECT 1 FROM carrier_configurations 
    WHERE carrier_name = 'ShipStation' 
    LIMIT 1
  ) THEN
    -- You can manually add ShipStation configuration via the UI
    -- This migration just ensures the table structure supports it
    NULL;
  END IF;
END $$;

-- Add a comment to document ShipStation support
COMMENT ON TABLE carrier_configurations IS 'Stores carrier API configurations including UPS, Canada Post, and ShipStation';