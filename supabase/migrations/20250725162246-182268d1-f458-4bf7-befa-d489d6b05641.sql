-- Update existing store configurations to use proper Canadian addresses
UPDATE public.store_configurations 
SET ship_from_address = '{
  "name": "Your Store",
  "company": "' || COALESCE((ship_from_address->>'company'), 'Your Company') || '",
  "address": "123 Store Street",
  "city": "Montreal",
  "state": "QC",
  "zip": "H2N 1Z4",
  "country": "CA"
}'::jsonb
WHERE ship_from_address->>'country' = 'US';