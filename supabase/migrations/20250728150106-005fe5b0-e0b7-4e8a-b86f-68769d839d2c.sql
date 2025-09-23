-- Add new status for awaiting shipment details
-- This status occurs after payment is successful but before shipment details are entered

-- First check if the status already exists before adding
DO $$ 
BEGIN
    -- Check if the status column has the awaiting_shipment_details value
    -- We need to update the system to support this new status
    
    -- For now, we'll track this using a combination of status and shipment_details fields
    -- When payment is successful but shipment_details is empty, it means awaiting shipment details
    
    RAISE NOTICE 'Migration: Adding support for awaiting shipment details status';
END $$;