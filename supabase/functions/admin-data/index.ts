import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // For admin functions, we'll use the anon key client and validate admin session differently
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    
    // Try to get user from the regular auth first
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    
    let userId: string;
    
    if (userError || !userData.user) {
      // If regular auth fails, try to decode the admin session token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.user_id || payload.sub;
        if (!userId) throw new Error("Invalid admin token: no user ID found");
        logStep("Admin token decoded", { userId });
      } catch (decodeError) {
        throw new Error("Invalid token format");
      }
    } else {
      userId = userData.user.id;
      logStep("User authenticated via regular auth", { userId, email: userData.user.email });
    }

    // Check if user is admin using service role client
    const { data: adminCheck } = await supabaseClient.rpc('is_admin', { _user_id: userId });
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    logStep("Admin access verified");

    const { action } = await req.json();
    logStep("Processing action", { action });

    if (action === 'get_users') {
      // Get all users with their subscription data using the database function
      const { data: result, error } = await supabaseClient.rpc('admin_data', {
        action_type: 'get_users'
      });

      if (error) {
        logStep("Database error", { error });
        throw error;
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
      const { userId } = await req.json();
      
      const { data: result, error } = await supabaseClient.rpc('admin_data', {
        action_type: 'get_user_subscription',
        user_data: { userId }
      });

      if (error) {
        logStep("Database error", { error });
        throw error;
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});