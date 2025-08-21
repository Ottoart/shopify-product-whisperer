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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log("🔐 Login attempt:", email);

    // Step 1: Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      console.error("❌ Supabase auth failed:", authError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or password" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Check if user exists in admin_users table
    const { data: adminUsers, error: adminCheckError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1);

    if (adminCheckError || !adminUsers || adminUsers.length === 0) {
      console.error("❌ Not an active admin:", email);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized admin access" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const adminUser = adminUsers[0];

    // Step 3: Build session response
    const adminSession = {
      user: {
        id: userId,
        email,
        role: adminUser.role ?? "admin",
        permissions: adminUser.permissions ?? [],
        display_name: adminUser.display_name ?? "Admin",
      },
      access_token: authData.session?.access_token,
      refresh_token: authData.session?.refresh_token,
      expires_at: authData.session?.expires_at,
    };

    console.log("✅ Admin login successful:", email);

    return new Response(
      JSON.stringify({ success: true, session: adminSession }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("🔥 Error in admin login:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Authentication failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
