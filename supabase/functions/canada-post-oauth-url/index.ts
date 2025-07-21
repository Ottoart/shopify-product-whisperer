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

    // Canada Post OAuth URL (this would be the actual Canada Post OAuth URL in production)
    // For now, we'll redirect to Canada Post business login and handle the manual flow
    const canadaPostOAuthUrl = 'https://www.canadapost-postescanada.ca/cpc/en/business/login.page';
    
    console.log(`Generated Canada Post OAuth URL for user ${user.id}`);
    console.log(`State: ${state}`);
    console.log(`Callback URL: ${callbackUrl}`);

    return new Response(
      JSON.stringify({ 
        auth_url: canadaPostOAuthUrl,
        state: state,
        callback_url: callbackUrl,
        instructions: 'After logging in to Canada Post, you will need to manually configure your API credentials in the carrier settings.'
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