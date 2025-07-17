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
    
    // Check if token needs refresh (if it expires within the next 5 minutes)
    const expiresAt = new Date(credentials.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return {
        success: true,
        credentials: {
          ...credentials,
          account_number: carrierConfig.account_number
        }
      };
    }

    console.log('🔄 UPS token expired, refreshing...');
    console.log('🔄 Token expires at:', credentials.token_expires_at);
    console.log('🔄 Current time:', now.toISOString());

    // Refresh the token using the refresh token
    const refreshBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token
    });

    const refreshResponse = await fetch('https://onlinetools.ups.com/security/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`,
        'x-merchant-id': credentials.client_id
      },
      body: refreshBody
    });

    const refreshData = await refreshResponse.text();
    
    if (!refreshResponse.ok) {
      console.error('🔄 Failed to refresh UPS token:', refreshData);
      return {
        success: false,
        error: `Failed to refresh UPS token: ${refreshData}`
      };
    }

    const tokenData = JSON.parse(refreshData);
    
    // Calculate new expiration time
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