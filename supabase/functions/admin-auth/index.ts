// /functions/admin-login/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import jwt from "https://esm.sh/jsonwebtoken@9";

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and password required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🔍 Find admin user
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id, email, password, role, is_active")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !adminUser) {
      console.error("Admin lookup error:", error?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Admin user not found or inactive" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("adminUser------------",adminUser)
    // 🔑 Compare password (plaintext now, replace with bcrypt later)
    if (adminUser.password !== password) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or password" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // 🎟️ Generate JWT
    const token = jwt.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      Deno.env.get("JWT_SECRET") || "super-secret-key",
      { expiresIn: "24h" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
