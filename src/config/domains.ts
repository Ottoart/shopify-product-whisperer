// Central domain configuration
export const DOMAINS = {
  // Main production domain for user-facing URLs
  PRODUCTION: 'https://prepfox.ca',
  
  // Supabase backend URLs (keep unchanged)
  SUPABASE_URL: 'https://rtaomiqsnctigleqjojt.supabase.co',
  SUPABASE_FUNCTIONS: 'https://rtaomiqsnctigleqjojt.supabase.co/functions/v1'
} as const;

// Helper function to get the correct redirect URL for authentication
export const getAuthRedirectUrl = (path: string = '') => {
  return `${DOMAINS.PRODUCTION}${path}`;
};

// Helper function to get callback URLs for OAuth integrations
export const getOAuthCallbackUrl = (service: string) => {
  return `${DOMAINS.PRODUCTION}/${service}-oauth-callback`;
};
