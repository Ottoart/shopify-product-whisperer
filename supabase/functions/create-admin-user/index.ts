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
    // Verify the requester is a master admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is master admin
    const { data: adminCheck, error: adminCheckError } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'master_admin')
      .eq('is_active', true)
      .single();

    if (adminCheckError || !adminCheck) {
      throw new Error("Insufficient permissions. Only master admins can create admin users.");
    }

    // Parse request body
    const { email, password, role, displayName, permissions } = await req.json();

    if (!email || !password || !role) {
      throw new Error("Missing required fields: email, password, role");
    }

    // Validate role
    const validRoles = ['admin', 'manager'];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role. Must be 'admin' or 'manager'");
    }

    // Create Supabase client with service role key for admin operations
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

    console.log(`Creating admin user: ${email} with role: ${role}`);

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      throw checkError;
    }

    const existingUser = existingUsers.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create the admin user
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split('@')[0],
        role: role
      }
    });

    if (authCreateError) {
      console.error("Error creating admin user:", authCreateError);
      throw authCreateError;
    }

    const newUser = authData.user;

    // Set default permissions based on role
    let defaultPermissions = {};
    if (role === 'admin') {
      defaultPermissions = {
        can_manage_users: true,
        can_manage_billing: true,
        can_manage_companies: true,
        can_view_logs: true,
        can_manage_feature_flags: false,
        can_create_admins: false
      };
    } else if (role === 'manager') {
      defaultPermissions = {
        can_manage_users: false,
        can_manage_billing: false,
        can_manage_companies: false,
        can_view_logs: true,
        can_manage_feature_flags: false,
        can_create_admins: false
      };
    }

    // Merge with custom permissions if provided
    const finalPermissions = { ...defaultPermissions, ...permissions };

    // Create admin_users record
    const { error: adminInsertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        user_id: newUser.id,
        role: role,
        permissions: finalPermissions,
        is_active: true,
        created_by: user.id
      });

    if (adminInsertError) {
      // If admin record creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      throw adminInsertError;
    }

    // Get PrepFox company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('name', 'PrepFox')
      .single();

    if (companyError) {
      console.error("Error finding PrepFox company:", companyError);
    } else {
      // Link admin to PrepFox company
      const { error: userCompanyError } = await supabaseAdmin
        .from('user_companies')
        .insert({
          user_id: newUser.id,
          company_id: company.id,
          role: role === 'admin' ? 'admin' : 'member',
          is_active: true
        });

      if (userCompanyError) {
        console.error("Error linking user to company:", userCompanyError);
      }
    }

    // Log the admin creation
    const { error: logError } = await supabaseAdmin
      .from('system_logs')
      .insert({
        admin_user_id: user.id,
        action: 'admin_user_created',
        target_type: 'admin_user',
        target_id: newUser.id,
        details: {
          email: email,
          role: role,
          created_by: user.email,
          permissions: finalPermissions
        }
      });

    if (logError) {
      console.error("Error creating log entry:", logError);
    }

    // Create welcome notification for new admin
    const { error: notificationError } = await supabaseAdmin
      .from('admin_notifications')
      .insert({
        admin_user_id: newUser.id,
        title: 'Welcome to PrepFox Admin',
        message: `Your admin account has been created with ${role} permissions. Please log in to access the admin dashboard.`,
        type: 'info'
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        data: {
          user_id: newUser.id,
          email: email,
          role: role,
          permissions: finalPermissions,
          display_name: displayName || email.split('@')[0]
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in admin user creation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});