-- Add new shipping fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS requested_service TEXT,
ADD COLUMN IF NOT EXISTS confirmation_type TEXT DEFAULT 'none';

-- Add comments for documentation
COMMENT ON COLUMN public.orders.requested_service IS 'Service requested by customer (e.g., UPS Ground, UPS Next Day Air)';
COMMENT ON COLUMN public.orders.confirmation_type IS 'Delivery confirmation type (none, signature, adult_signature)';