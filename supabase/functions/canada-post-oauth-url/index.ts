import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body to get account type
    const body = await req.json().catch(() => ({}));
    const accountType = body.accountType || 'small_business';

    // Generate a state parameter for security
    const state = crypto.randomUUID();
    
    // Store the state in the database temporarily (expires in 10 minutes)
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        platform: 'canada-post',
        event_type: 'oauth_state',
        notification_id: state,
        payload: { 
          user_id: user.id,
          account_type: accountType,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        }
      });

    if (insertError) {
      console.error('Error storing OAuth state:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create OAuth session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the base URL for the callback
    const baseUrl = req.headers.get('origin') || 'https://751c8744-5cc2-4126-b021-cefc67bc436e.lovableproject.com';
    const callbackUrl = `${baseUrl}/canada-post-oauth-callback`;

    // Canada Post login URL (matches ShipStation's exact approach)
    const canadaPostOAuthUrl = `https://sso-osu.canadapost-postescanada.ca/lfe-cap/en/login?` +
      `templateId=cpcapps&` +
      `manifestId=cpgSecurity&` +
      `language=en_CA&` +
      `stepupId=smb_link,commercial_link,smb_mode2&` +
      `sourceApp=DRC&` +
      `profile=${encodeURIComponent('{"language":"en"}')}&` +
      `sourceUrl=${encodeURIComponent('https://www.canadapost-postescanada.ca/information/app/drc/home')}&` +
      `targetUrl=${encodeURIComponent(`https://www.canadapost-postescanada.ca/information/app/drc/merchant?state=${state}&callback=${encodeURIComponent(callbackUrl)}&language=en_CA&forceVouchFor=true`)}`;
    
    console.log(`Generated Canada Post OAuth URL for user ${user.id}`);
    console.log(`Account Type: ${accountType}`);
    console.log(`State: ${state}`);
    console.log(`Callback URL: ${callbackUrl}`);
    console.log(`OAuth URL: ${canadaPostOAuthUrl}`);

    return new Response(
      JSON.stringify({ 
        auth_url: canadaPostOAuthUrl,
        state: state,
        callback_url: callbackUrl,
        account_type: accountType,
        instructions: 'You will be redirected to Canada Post login. After logging in and authorizing, you will be redirected back to complete the setup.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Canada Post OAuth URL generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});