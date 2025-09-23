-- Fix malformed store configuration data for prohairca account
-- Clean the access token from JSON format to proper format
-- Clean the domain from timestamped format to proper format

UPDATE store_configurations 
SET 
  access_token = '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',
  domain = 'protoys.myshopify.com'
WHERE id = 'd8e66ef5-34d3-44db-864d-dfac340e80bc';