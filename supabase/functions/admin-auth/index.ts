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
        JSON.stringify({ error: "Email and password required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!// 👈 use anon key for auth
    ); 
     const { data111, error1111 } = await supabase.auth.admin.createUser({
      email: "admin@prepfox.com",
      password: "Prepfox00@",
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { role: "admin" }
  });
      
      if (error1111) {
        console.error("❌ Error creating admin user:", error1111);
      } else {
        console.log("✅ Created admin userqqqqqq:",email,password);
      }
    
    // Supabase sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    "admin@prepfox.com",
    "Prepfox00@",
  });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Check if user is admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", data.user.id)
      .single();

    console.log("adminUser------------------------",adminUser)
    
    if (adminError || !adminUser?.is_active) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { headers: corsHeaders, status: 403 }
      );
    }

    // ✅ Return Supabase session (already has JWT)
    return new Response(
      JSON.stringify({
        success: true,
        user: data.user,
        session: data.session, // contains access_token + refresh_token
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
