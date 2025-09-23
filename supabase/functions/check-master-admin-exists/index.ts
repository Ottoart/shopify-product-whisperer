import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("Checking for master admin existence...");

    // Check if any master admin exists
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('role', 'master_admin')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error("Error checking master admin existence:", error);
      throw error;
    }

    const exists = data && data.length > 0;
    console.log("Master admin exists:", exists);

    return new Response(
      JSON.stringify({
        success: true,
        exists: exists
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in master admin check:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        exists: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});