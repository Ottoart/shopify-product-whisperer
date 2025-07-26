-- Sync test account (prohairca@gmail.com) with main account functionality
-- First, let's get the user IDs for reference
-- ottman1@gmail.com user_id: 5dc08974-14f4-4c64-8c4b-b501fd4d1630
-- prohairca@gmail.com user_id: dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc

-- 1. Complete profile setup for test account
INSERT INTO public.profiles (user_id, display_name, created_at, updated_at)
VALUES (
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'ProHair Test Account',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = now();

-- Update customer profile for test account
INSERT INTO public.customer_profiles (user_id, first_name, last_name, company_name, created_at, updated_at)
VALUES (
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'ProHair',
  'Testing',
  'ProHair Test Company',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_name = EXCLUDED.company_name,
  updated_at = now();

-- 2. Create placeholder carrier configurations (user will need to add actual credentials)
INSERT INTO public.carrier_configurations (
  user_id,
  carrier_name,
  is_active,
  api_credentials,
  settings,
  created_at,
  updated_at
) VALUES 
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'UPS',
  false, -- inactive until user adds real credentials
  '{"client_id": "", "client_secret": "", "environment": "sandbox"}',
  '{"default_service": "03", "pickup_type": "01"}',
  now(),
  now()
),
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'Canada Post',
  false, -- inactive until user adds real credentials
  '{"api_key": "", "api_secret": "", "customer_number": "", "environment": "development"}',
  '{"default_service": "DOM.RP", "contract_id": ""}',
  now(),
  now()
),
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'ShipStation',
  false, -- inactive until user adds real credentials
  '{"api_key": "", "api_secret": ""}',
  '{}',
  now(),
  now()
)
ON CONFLICT (user_id, carrier_name) DO UPDATE SET
  updated_at = now();

-- 3. Create sample test orders for shipping functionality testing
INSERT INTO public.orders (
  user_id,
  order_number,
  customer_name,
  customer_email,
  store_name,
  store_platform,
  total_amount,
  currency,
  status,
  order_date,
  shipping_address_line1,
  shipping_city,
  shipping_state,
  shipping_zip,
  shipping_country,
  created_at,
  updated_at
) VALUES 
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'TEST-001',
  'John Test Customer',
  'john.test@example.com',
  'Test Store',
  'Shopify',
  29.99,
  'USD',
  'awaiting',
  now(),
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  'US',
  now(),
  now()
),
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'TEST-002',
  'Jane Test Customer',
  'jane.test@example.com',
  'Test Store',
  'eBay',
  45.50,
  'USD',
  'awaiting',
  now(),
  '456 Test Avenue',
  'Los Angeles',
  'CA',
  '90001',
  'US',
  now(),
  now()
);

-- 4. Create sample products for testing (without description column)
INSERT INTO public.products (
  user_id,
  title,
  price,
  currency,
  sku,
  status,
  created_at,
  updated_at
) VALUES 
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'Test Hair Product 1',
  19.99,
  'USD',
  'TEST-HAIR-001',
  'active',
  now(),
  now()
),
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'Test Hair Product 2',
  24.99,
  'USD',
  'TEST-HAIR-002',
  'active',
  now(),
  now()
);

-- 5. Create order items for the test orders
INSERT INTO public.order_items (
  order_id,
  product_title,
  sku,
  quantity,
  price,
  weight_lbs,
  created_at
) 
SELECT 
  o.id,
  'Test Hair Product 1',
  'TEST-HAIR-001',
  1,
  19.99,
  0.5,
  now()
FROM public.orders o 
WHERE o.user_id = 'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc' 
AND o.order_number = 'TEST-001';

INSERT INTO public.order_items (
  order_id,
  product_title,
  sku,
  quantity,
  price,
  weight_lbs,
  created_at
) 
SELECT 
  o.id,
  'Test Hair Product 2',
  'TEST-HAIR-002',
  2,
  24.99,
  0.3,
  now()
FROM public.orders o 
WHERE o.user_id = 'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc' 
AND o.order_number = 'TEST-002';

-- 6. Create marketplace sync status for test account
INSERT INTO public.marketplace_sync_status (
  user_id,
  marketplace,
  sync_status,
  products_synced,
  total_products_found,
  active_products_synced,
  created_at,
  updated_at
) VALUES 
(
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'Shopify',
  'completed',
  2,
  2,
  2,
  now(),
  now()
) ON CONFLICT (user_id, marketplace) DO UPDATE SET
  sync_status = EXCLUDED.sync_status,
  products_synced = EXCLUDED.products_synced,
  total_products_found = EXCLUDED.total_products_found,
  active_products_synced = EXCLUDED.active_products_synced,
  updated_at = now();

-- 7. Ensure delivery preferences exist
INSERT INTO public.delivery_preferences (
  user_id,
  preferred_delivery_time,
  signature_required,
  notification_preferences,
  created_at,
  updated_at
) VALUES (
  'dc636344-6aff-4eaf-bfcd-a9d8d21f8bfc',
  'anytime',
  false,
  '{"sms": false, "push": false, "email": true}',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;