
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
    const url = new URL(req.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    console.log('Canada Post OAuth callback:', { state, code });

    if (!state) {
      return new Response(
        JSON.stringify({ error: 'Missing state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the state parameter
    const { data: stateRecord, error: stateError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('notification_id', state)
      .eq('platform', 'canada-post')
      .eq('event_type', 'oauth_state')
      .single();

    if (stateError || !stateRecord) {
      console.error('Invalid or expired state:', stateError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authorization session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = stateRecord.payload.user_id;

    // Clean up the state record
    await supabase
      .from('webhook_events')
      .delete()
      .eq('id', stateRecord.id);

    // For now, we'll create a placeholder configuration that users can update
    // In a real implementation, this would exchange the code for actual tokens
    const placeholderConfig = {
      account_number: '',
      account_type: 'Commercial',
      contract_number: '',
      payment_method: 'Account',
      api_key: '',
      api_secret: '',
      customer_number: '',
      authorization_pending: true,
      authorized_at: new Date().toISOString()
    };

    // Check if user already has a Canada Post configuration
    const { data: existingConfig } = await supabase
      .from('carrier_configurations')
      .select('id')
      .eq('user_id', userId)
      .eq('carrier_name', 'Canada Post')
      .single();

    if (existingConfig) {
      // Update existing configuration
      const { error: updateError } = await supabase
        .from('carrier_configurations')
        .update({
          api_credentials: placeholderConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);

      if (updateError) {
        console.error('Error updating Canada Post configuration:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update carrier configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new configuration
      const { error: insertError } = await supabase
        .from('carrier_configurations')
        .insert({
          user_id: userId,
          carrier_name: 'Canada Post',
          api_credentials: placeholderConfig,
          settings: {
            enabled_services: ['REG', 'EXP', 'PC'],
            user_configured: true
          },
          is_active: true,
          pickup_type_code: '01',
          default_package_type: '02'
        });

      if (insertError) {
        console.error('Error creating Canada Post configuration:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create carrier configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Canada Post OAuth callback completed for user ${userId}`);

    // Redirect back to ProHair domain
    const redirectUrl = `https://prohair.ca/settings?tab=carriers&canada-post=authorized`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });

  } catch (error) {
    console.error('Canada Post OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
