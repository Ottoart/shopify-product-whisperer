-- Add ShipStation API credentials as secrets
-- These will be used by the ShipStation carrier integration

-- Insert ShipStation API Key secret (if not exists)
INSERT INTO vault.secrets (name, secret, description, key_id, created_at, updated_at)
SELECT 
    'SHIPSTATION_API_KEY',
    '1c4dd42add2a4963842dee2e1971ff35',
    'ShipStation API Key for shipping integration',
    (SELECT id FROM pgsodium.valid_key() LIMIT 1),
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM vault.secrets WHERE name = 'SHIPSTATION_API_KEY'
);

-- Insert ShipStation API Secret (if not exists)
INSERT INTO vault.secrets (name, secret, description, key_id, created_at, updated_at)
SELECT 
    'SHIPSTATION_API_SECRET',
    '770f40d74b5c4bd5a4d87c7884750a6c',
    'ShipStation API Secret for shipping integration',
    (SELECT id FROM pgsodium.valid_key() LIMIT 1),
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM vault.secrets WHERE name = 'SHIPSTATION_API_SECRET'
);

-- Comment on the additions
COMMENT ON TABLE vault.secrets IS 'Stores encrypted secrets including ShipStation API credentials for carrier integrations';