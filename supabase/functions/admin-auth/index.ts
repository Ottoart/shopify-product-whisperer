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
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and password are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Supabase client (anon for auth)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

   // Try login first
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      if (authError.message === "Invalid login credentials") {
        // User exists but wrong password
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email or password" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

  // Otherwise → try signup
     console.log("Login failed, trying signup...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

  if (signUpError) {
    return new Response(
      JSON.stringify({ success: false, error: signUpError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  authData = signUpData;
}


    const user = authData.user;

    // Verify admin_users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authorized as admin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: { ...user, role: adminUser.role },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in login/signup:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Authentication failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
