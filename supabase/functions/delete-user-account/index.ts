import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    console.log(`Starting account deletion for user ${user.id}`);

    // Call the cascade delete function to clean up all user data
    const { error: cleanupError } = await supabaseClient.rpc('cascade_delete_user_data', {
      user_uuid: user.id
    });

    if (cleanupError) {
      console.error('Error during data cleanup:', cleanupError);
      throw new Error(`Data cleanup failed: ${cleanupError.message}`);
    }

    // Delete the user account from auth.users
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Error deleting user account:', deleteUserError);
      throw new Error(`Account deletion failed: ${deleteUserError.message}`);
    }

    console.log(`Account deletion completed for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account successfully deleted'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});