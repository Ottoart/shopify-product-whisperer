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
        JSON.stringify({
          success: false,
          error: "Email and password are required"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create Supabase client with service role key
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

    console.log("Admin auth attempt for:", email);

    // Check if user exists and has admin role
    const { data: adminUser, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select(`
        *,
        profiles:user_id (
          display_name
        )
      `)
      .eq('is_active', true)
      .single();

    if (adminCheckError) {
      console.error("Error checking admin user:", adminCheckError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid admin credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Get the auth user details
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(adminUser.user_id);
    
    if (authError || !authUser.user) {
      console.error("Error getting auth user:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid admin credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Check if email matches
    if (authUser.user.email !== email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid admin credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // For demo purposes, use fixed admin credentials
    const validCredentials = [
      { email: "admin@prepfox.com", password: "Prepfox00@" },
      { email: "ottman1@gmail.com", password: "Prepfox00@" }
    ];

    const isValidCredential = validCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (!isValidCredential) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid admin credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Create admin session token (simplified for demo)
    const adminSession = {
      user: {
        id: adminUser.user_id,
        email: authUser.user.email,
        role: adminUser.role,
        permissions: adminUser.permissions,
        display_name: adminUser.profiles?.display_name || "Admin"
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      session_id: crypto.randomUUID()
    };

    console.log("Admin login successful for:", email);

    return new Response(
      JSON.stringify({
        success: true,
        session: adminSession
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in admin auth:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Authentication failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});