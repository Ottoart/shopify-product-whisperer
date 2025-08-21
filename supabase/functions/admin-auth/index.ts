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

    // Check if user exists and has admin role - get all active admin users first
    const { data: adminUsers, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('is_active', true);

    if (adminCheckError || !adminUsers || adminUsers.length === 0) {
      console.error("Error checking admin users:", adminCheckError);
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

    // Find the admin user that matches the email (simplified for demo)
    const adminUser = adminUsers.find(user => {
      // For demo, match against the valid credentials
      const validCred = validCredentials.find(cred => cred.email === email);
      return validCred;
    }) || adminUsers[0]; // Use first admin if no specific match

    console.log('🎫 Creating session for admin user:', {
      userId: adminUser.user_id,
      email: email,
      role: adminUser.role
    });

    // Get or create a Supabase user for this admin
    let supabaseUser = null;
    try {
      // Try to get existing user
      const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(adminUser.user_id);
      
      if (getUserError && getUserError.message?.includes('User not found')) {
        // Create a new Supabase user for this admin
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          id: adminUser.user_id,
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            role: adminUser.role,
            display_name: "Admin",
            is_admin: true
          }
        });
        
        if (createError) {
          console.error("Error creating Supabase user:", createError);
          throw createError;
        }
        supabaseUser = newUser.user;
        console.log("Created Supabase user for admin:", email);
      } else if (existingUser) {
        supabaseUser = existingUser;
        console.log("Found existing Supabase user for admin:", email);
      }
    } catch (error) {
      console.error("Error setting up Supabase user:", error);
      // Continue without valid token
    }

    // Generate a proper JWT token using Supabase admin
    let jwtToken = null;
    if (supabaseUser) {
      try {
        // Generate an access token for the admin user
        const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateAccessToken(supabaseUser.id);
        
        if (tokenData && !tokenError) {
          jwtToken = tokenData;
          console.log('✅ Generated valid JWT token for admin');
        } else {
          console.error('Error generating access token:', tokenError);
        }
      } catch (error) {
        console.error("Error generating JWT token:", error);
        // Fallback: create a simple session token
        try {
          const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email: email,
            password: `admin-${adminUser.user_id}` // Use a predictable password for admin
          });
          
          if (signInData?.session?.access_token && !signInError) {
            jwtToken = signInData.session.access_token;
            console.log('✅ Generated JWT token via sign in');
          }
        } catch (fallbackError) {
          console.error("Fallback token generation failed:", fallbackError);
        }
      }
    }

    // Create admin session
    const adminSession = {
      user: {
        id: adminUser.user_id,
        email: email,
        role: adminUser.role,
        permissions: adminUser.permissions,
        display_name: "Admin"
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      session_id: crypto.randomUUID(),
      jwt_token: jwtToken
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