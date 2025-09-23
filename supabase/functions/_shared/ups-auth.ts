export async function ensureValidUPSTokenForRating(supabase: any, userId: string): Promise<{ success: boolean, credentials?: any, error?: string }> {
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
    
    console.log('🔍 Checking UPS credentials for rating:', {
      hasAccessToken: Boolean(credentials.access_token),
      hasClientId: Boolean(credentials.client_id),
      hasClientSecret: Boolean(credentials.client_secret),
      hasRefreshToken: Boolean(credentials.refresh_token),
      expiresAt: credentials.token_expires_at
    });
    
    // Check if we have basic credentials
    if (!credentials.client_id || !credentials.client_secret) {
      return {
        success: false,
        error: 'UPS client credentials not configured properly'
      };
    }
    
    // For rating API, only refresh if token is actually expired or missing
    let needsRefresh = false;
    
    if (!credentials.access_token) {
      console.log('🔄 No access token available, getting new one');
      needsRefresh = true;
    } else if (credentials.token_expires_at) {
      const expiresAt = new Date(credentials.token_expires_at);
      const now = new Date();
      
      if (expiresAt <= now) {
        console.log('🔄 Token has expired, refreshing');
        needsRefresh = true;
      }
    } else {
      console.log('🔄 No expiration time set, refreshing token');
      needsRefresh = true;
    }
    
    if (!needsRefresh) {
      // Token is still valid
      console.log('✅ Using existing valid token for rating');
      return {
        success: true,
        credentials: {
          ...credentials,
          account_number: carrierConfig.account_number
        }
      };
    }

    // Continue with refresh logic...
    return await refreshUPSToken(supabase, carrierConfig, credentials);

  } catch (error) {
    console.error('🔄 Error ensuring valid UPS token for rating:', error);
    return {
      success: false,
      error: `Token validation failed: ${error.message}`
    };
  }
}

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
      hasAccessToken: Boolean(credentials.access_token),
      hasClientId: Boolean(credentials.client_id),
      hasClientSecret: Boolean(credentials.client_secret),
      hasRefreshToken: Boolean(credentials.refresh_token),
      expiresAt: credentials.token_expires_at
    });
    
    // Check if we have basic credentials
    if (!credentials.client_id || !credentials.client_secret) {
      return {
        success: false,
        error: 'UPS client credentials not configured properly'
      };
    }
    
    // Always refresh the token for shipment API calls (UPS shipment API is more strict)
    // Check if token needs refresh (if it expires within the next 30 minutes or doesn't exist)
    let needsRefresh = false;
    
    if (!credentials.access_token) {
      console.log('🔄 No access token available, getting new one');
      needsRefresh = true;
    } else if (credentials.token_expires_at) {
      const expiresAt = new Date(credentials.token_expires_at);
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes buffer
      
      if (expiresAt <= thirtyMinutesFromNow) {
        console.log('🔄 Token expires within 30 minutes, refreshing for shipment API');
        needsRefresh = true;
      }
    } else {
      console.log('🔄 No expiration time set, refreshing token');
      needsRefresh = true;
    }
    
    // For rating API calls, allow some buffer time but don't force refresh
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


    // Continue with refresh logic...
    return await refreshUPSToken(supabase, carrierConfig, credentials);

  } catch (error) {
    console.error('🔄 Error ensuring valid UPS token:', error);
    return {
      success: false,
      error: `Token validation failed: ${error.message}`
    };
  }
}

async function refreshUPSToken(supabase: any, carrierConfig: any, credentials: any): Promise<{ success: boolean, credentials?: any, error?: string }> {
  console.log('🔄 UPS token needs refresh...');
  console.log('🔄 Token expires at:', credentials.token_expires_at);
  console.log('🔄 Current time:', new Date().toISOString());

  // For authorization code flow, we need to use refresh_token grant type
  if (!credentials.refresh_token) {
    return {
      success: false,
      error: 'No refresh token available. Please re-authorize with UPS.'
    };
  }

  const tokenBody = new URLSearchParams({ 
    grant_type: 'refresh_token',
    refresh_token: credentials.refresh_token
  });

  console.log('🔄 Using grant type: refresh_token (authorization code flow)');
  console.log('🔄 Client ID:', credentials.client_id);
  console.log('🔄 Has refresh token:', Boolean(credentials.refresh_token));
  
  // Use the refresh endpoint as documented by UPS
  const tokenUrl = 'https://wwwcie.ups.com/security/v1/oauth/refresh';
  console.log('🔄 Using SANDBOX UPS OAuth refresh endpoint:', tokenUrl);

  // Create proper Basic Auth header according to UPS spec
  const authString = btoa(`${credentials.client_id}:${credentials.client_secret}`);
  console.log('🔄 Authorization header created (first 20 chars):', `Basic ${authString}`.substring(0, 20));

  // Use proper UPS OAuth 2.0 refresh endpoint with correct headers per UPS documentation
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
}