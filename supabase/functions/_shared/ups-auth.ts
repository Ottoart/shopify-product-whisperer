export async function ensureValidUPSToken(supabase: any, userId: string): Promise<{ success: boolean, credentials?: any, error?: string }> {
  try {
    // Get UPS carrier configuration
    const { data: carrierConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .single();

    if (configError || !carrierConfig) {
      return { 
        success: false, 
        error: 'UPS not configured for this user' 
      };
    }

    const credentials = carrierConfig.api_credentials as any;
    
    console.log('🔍 Checking UPS credentials:', {
      hasAccessToken: !!credentials.access_token,
      hasClientId: !!credentials.client_id,
      hasClientSecret: !!credentials.client_secret,
      hasRefreshToken: !!credentials.refresh_token,
      expiresAt: credentials.token_expires_at
    });
    
    // Check if we have basic credentials
    if (!credentials.client_id || !credentials.client_secret) {
      return {
        success: false,
        error: 'UPS client credentials not configured properly'
      };
    }
    
    // Check if token needs refresh (if it expires within the next 5 minutes)
    // Or if there's no access token at all
    let needsRefresh = false;
    
    if (!credentials.access_token) {
      console.log('🔄 No access token available, getting new one');
      needsRefresh = true;
    } else if (credentials.token_expires_at) {
      const expiresAt = new Date(credentials.token_expires_at);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      if (expiresAt <= fiveMinutesFromNow) {
        console.log('🔄 Token expires soon, refreshing');
        needsRefresh = true;
      }
    } else {
      console.log('🔄 No expiration time set, refreshing token');
      needsRefresh = true;
    }

    if (!needsRefresh) {
      // Token is still valid
      console.log('✅ Using existing valid token');
      return {
        success: true,
        credentials: {
          ...credentials,
          account_number: carrierConfig.account_number
        }
      };
    }

    console.log('🔄 UPS token needs refresh...');
    console.log('🔄 Token expires at:', credentials.token_expires_at);
    console.log('🔄 Current time:', new Date().toISOString());

    // UPS OAuth 2.0 only supports client_credentials grant type
    // No refresh tokens - always get a fresh token using client credentials
    const tokenBody = new URLSearchParams({ 
      grant_type: 'client_credentials' 
    });

    console.log('🔄 Using grant type: client_credentials (UPS requirement)');
    console.log('🔄 Client ID:', credentials.client_id);
    
    // Determine if we're using production or sandbox based on the credentials
    const isProduction = credentials.environment === 'production';
    const tokenUrl = isProduction 
      ? 'https://onlinetools.ups.com/security/v1/oauth/token'  // Production
      : 'https://wwwcie.ups.com/security/v1/oauth/token';      // Sandbox
      
    console.log(`🔄 Using ${isProduction ? 'PRODUCTION' : 'SANDBOX'} UPS OAuth endpoint: ${tokenUrl}`);

    // Create proper Basic Auth header
    const authString = btoa(`${credentials.client_id}:${credentials.client_secret}`);
    console.log('🔄 Authorization header created (first 20 chars):', `Basic ${authString}`.substring(0, 20));

    // Use proper UPS OAuth 2.0 endpoint with correct headers
    const refreshResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      },
      body: tokenBody
    });

    console.log('🔄 Token response status:', refreshResponse.status);
    console.log('🔄 Token response headers:', Object.fromEntries(refreshResponse.headers.entries()));
    
    const refreshData = await refreshResponse.text();
    console.log('🔄 Token response body:', refreshData);
    
    if (!refreshResponse.ok) {
      console.error('🔄 Failed to refresh UPS token. Status:', refreshResponse.status);
      console.error('🔄 Response:', refreshData);
      return {
        success: false,
        error: `Failed to refresh UPS token: ${refreshData}`
      };
    }

    const tokenData = JSON.parse(refreshData);
    
    // Calculate new expiration time
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + (tokenData.expires_in * 1000));

    // Update the credentials with new token
    const updatedCredentials = {
      ...credentials,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || credentials.refresh_token,
      token_expires_at: newExpiresAt.toISOString()
    };

    // Save updated credentials to database
    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({ 
        api_credentials: updatedCredentials,
        updated_at: new Date().toISOString()
      })
      .eq('id', carrierConfig.id);

    if (updateError) {
      console.error('🔄 Failed to update credentials:', updateError);
      return {
        success: false,
        error: 'Failed to save refreshed token'
      };
    }

    console.log('🔄 Successfully refreshed UPS token');
    console.log('🔄 New token expires at:', newExpiresAt.toISOString());

    return {
      success: true,
      credentials: {
        ...updatedCredentials,
        account_number: carrierConfig.account_number
      }
    };

  } catch (error) {
    console.error('🔄 Error ensuring valid UPS token:', error);
    return {
      success: false,
      error: `Token validation failed: ${error.message}`
    };
  }
}