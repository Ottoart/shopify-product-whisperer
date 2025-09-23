import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, carrier_id } = await req.json();
    
    if (!user_id || !carrier_id) {
      return new Response(
        JSON.stringify({ error: 'User ID and Carrier ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Activating carrier ${carrier_id} for user: ${user_id}`);

    // Update carrier configuration to active
    const { data, error } = await supabase
      .from('carrier_configurations')
      .update({ is_active: true })
      .eq('id', carrier_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error activating carrier:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to activate carrier configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Carrier activated successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        carrier: data,
        message: 'Carrier activated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in activate-carrier:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});