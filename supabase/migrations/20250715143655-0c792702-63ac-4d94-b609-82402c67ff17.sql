-- Add storefront_domain field to store_configurations table
ALTER TABLE public.store_configurations 
ADD COLUMN storefront_domain text;

-- Add comment to explain the field
COMMENT ON COLUMN public.store_configurations.storefront_domain IS 'The public storefront domain (e.g., prohair.ca) used for generating product page URLs';