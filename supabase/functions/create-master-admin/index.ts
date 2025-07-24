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

    console.log("Starting master admin creation process...");

    // Check if master admin already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error("Error checking existing users:", checkError);
      throw checkError;
    }

    const masterAdminEmail = Deno.env.get('MASTER_ADMIN_EMAIL') || "admin@prepfox.com";
    const masterAdminPassword = Deno.env.get('MASTER_ADMIN_PASSWORD') || crypto.randomUUID();
    
    let masterUser = existingAdmin.users.find(user => user.email === masterAdminEmail);

    if (!masterUser) {
      console.log("Creating master admin user...");
      // Create the master admin user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: masterAdminEmail,
        password: masterAdminPassword,
        email_confirm: true,
        user_metadata: {
          display_name: "Master Admin",
          role: "master_admin"
        }
      });
      
      // Log the generated password for the first setup only
      if (authData?.user) {
        console.log(`Master admin created with email: ${masterAdminEmail}`);
        if (!Deno.env.get('MASTER_ADMIN_PASSWORD')) {
          console.log(`Generated password: ${masterAdminPassword}`);
        }
      }

      if (authError) {
        console.error("Error creating master admin user:", authError);
        throw authError;
      }

      masterUser = authData.user;
      console.log("Master admin user created successfully");
    } else {
      console.log("Master admin user already exists");
    }

    // Check if admin_users record exists
    const { data: adminRecord, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', masterUser.id)
      .single();

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error("Error checking admin record:", adminCheckError);
      throw adminCheckError;
    }

    if (!adminRecord) {
      console.log("Creating admin_users record...");
      // Create admin_users record
      const { error: adminInsertError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          user_id: masterUser.id,
          role: 'master_admin',
          permissions: {
            can_manage_users: true,
            can_manage_billing: true,
            can_manage_companies: true,
            can_view_logs: true,
            can_manage_feature_flags: true,
            can_create_admins: true
          },
          is_active: true,
          created_by: masterUser.id
        });

      if (adminInsertError) {
        console.error("Error creating admin record:", adminInsertError);
        throw adminInsertError;
      }
      console.log("Admin record created successfully");
    } else {
      console.log("Admin record already exists");
    }

    // Create default company for PrepFox
    const { data: existingCompany, error: companyCheckError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('name', 'PrepFox')
      .single();

    if (companyCheckError && companyCheckError.code !== 'PGRST116') {
      console.error("Error checking company:", companyCheckError);
      throw companyCheckError;
    }

    let company = existingCompany;
    if (!company) {
      console.log("Creating PrepFox company...");
      const { data: newCompany, error: companyInsertError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: 'PrepFox',
          domain: 'prepfox.com',
          subscription_plan: 'enterprise',
          subscription_status: 'active',
          billing_email: masterAdminEmail,
          settings: {
            features: {
              shipping_module: true,
              repricing_module: true,
              fulfillment_module: true,
              analytics_module: true
            }
          }
        })
        .select()
        .single();

      if (companyInsertError) {
        console.error("Error creating company:", companyInsertError);
        throw companyInsertError;
      }
      company = newCompany;
      console.log("PrepFox company created successfully");
    } else {
      console.log("PrepFox company already exists");
    }

    // Link master admin to company
    const { data: existingUserCompany, error: userCompanyCheckError } = await supabaseAdmin
      .from('user_companies')
      .select('*')
      .eq('user_id', masterUser.id)
      .eq('company_id', company.id)
      .single();

    if (userCompanyCheckError && userCompanyCheckError.code !== 'PGRST116') {
      console.error("Error checking user company:", userCompanyCheckError);
      throw userCompanyCheckError;
    }

    if (!existingUserCompany) {
      console.log("Linking master admin to company...");
      const { error: userCompanyError } = await supabaseAdmin
        .from('user_companies')
        .insert({
          user_id: masterUser.id,
          company_id: company.id,
          role: 'owner',
          is_active: true
        });

      if (userCompanyError) {
        console.error("Error linking user to company:", userCompanyError);
        throw userCompanyError;
      }
      console.log("Master admin linked to company successfully");
    }

    // Log the admin creation
    const { error: logError } = await supabaseAdmin
      .from('system_logs')
      .insert({
        admin_user_id: masterUser.id,
        action: 'master_admin_setup',
        target_type: 'admin_user',
        target_id: masterUser.id,
        details: {
          email: masterAdminEmail,
          role: 'master_admin',
          company: 'PrepFox'
        }
      });

    if (logError) {
      console.error("Error creating log entry:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Master admin account created successfully",
        data: {
          user_id: masterUser.id,
          email: masterAdminEmail,
          role: 'master_admin',
          company: company.name
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in master admin creation:", error);
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