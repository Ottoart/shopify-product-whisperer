import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateAdminAuth } from "../_shared/admin-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-DATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Use the shared admin auth validation
    const authResult = await validateAdminAuth(authHeader);
    if (authResult.error) {
      throw new Error(`Authentication error: ${authResult.error}`);
    }
    
    const user = authResult.user;
    const adminRole = authResult.adminRole;
    logStep("Admin authenticated", { userId: user.id, email: user.email, role: adminRole });

     const requestBody = await req.json();
    const { action, userId } = requestBody;
    
    logStep("Processing action", { action, userId });

    if (action === 'get_users') {
      // Get all users with their subscription data using the database function
      const { data: result, error } = await supabaseClient.rpc('admin_data', {
        action_type: 'get_users'
      });

      if (error) {
        logStep("Database error", { error: error.message || error });
        throw new Error(`Database error: ${error.message || String(error)}`);
      }

      logStep("Users fetched successfully", { count: result?.users?.length || 0 });
      
      return new Response(JSON.stringify({
        success: true,
        users: result?.users || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'get_user_subscription') {
      if (!userId) {
        throw new Error('userId is required for get_user_subscription action');
      }
      
      const { data: result, error } = await supabaseClient.rpc('admin_data', {
        action_type: 'get_user_subscription',
        user_data: { userId }
      });

      if (error) {
        logStep("Database error", { error: error.message || error });
        throw new Error(`Database error: ${error.message || String(error)}`);
      }

      logStep("User subscription fetched successfully", { userId });
      
      return new Response(JSON.stringify({
        success: true,
        ...result
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error(`Invalid action: ${action}`);
    }

  } catch (error) {
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || JSON.stringify(error);
    }
    
    logStep("ERROR", { message: errorMessage, errorType: typeof error });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});