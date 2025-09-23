-- Fix security warnings

-- 1. Reduce OTP expiry to recommended threshold (1 hour = 3600 seconds)
UPDATE auth.config SET value = '3600' WHERE key = 'OTP_EXPIRY';

-- 2. Enable leaked password protection  
UPDATE auth.config SET value = 'true' WHERE key = 'SECURITY_LEAKED_PASSWORD_PROTECTION';

-- Alternative approach if the above doesn't work due to auth schema restrictions
-- These settings might need to be configured through Supabase dashboard instead