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
    const { data_type, session_token } = await req.json();

    if (!session_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session token is required"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
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

    console.log("Admin data request for:", data_type);

    let result = { success: false, data: null, error: null };

    switch (data_type) {
      case 'admin_users':
        const { data: adminUsers, error: adminError } = await supabaseAdmin
          .from('admin_users')
          .select('*');
        
        result = { 
          success: !adminError, 
          data: adminUsers || [], 
          error: adminError?.message 
        };
        break;

      case 'companies':
        const { data: companies, error: companiesError } = await supabaseAdmin
          .from('companies')
          .select('*');
        
        result = { 
          success: !companiesError, 
          data: companies || [], 
          error: companiesError?.message 
        };
        break;

      case 'all_users':
        // Get all users with comprehensive data
        const { data: allUsers, error: usersError } = await supabaseAdmin
          .from('profiles')
          .select(`
            *,
            admin_users (
              id,
              role,
              is_active,
              created_at
            )
          `);
        
        result = { 
          success: !usersError, 
          data: allUsers || [], 
          error: usersError?.message 
        };
        break;

      case 'user_stats':
        // Get comprehensive user statistics
        const { data: userCount, error: userCountError } = await supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact' });

        const { data: adminCount, error: adminCountError } = await supabaseAdmin
          .from('admin_users')
          .select('id', { count: 'exact' })
          .eq('is_active', true);

        const { data: companyCount, error: companyCountError } = await supabaseAdmin
          .from('companies')
          .select('id', { count: 'exact' });

        const { data: activeCompanies, error: activeCompaniesError } = await supabaseAdmin
          .from('companies')
          .select('id', { count: 'exact' })
          .eq('subscription_status', 'active');

        if (userCountError || adminCountError || companyCountError || activeCompaniesError) {
          result = { 
            success: false, 
            data: null, 
            error: "Error fetching statistics" 
          };
        } else {
          result = { 
            success: true, 
            data: {
              totalUsers: userCount?.length || 0,
              totalAdmins: adminCount?.length || 0,
              totalCompanies: companyCount?.length || 0,
              activeSubscriptions: activeCompanies?.length || 0
            }, 
            error: null 
          };
        }
        break;

      default:
        result = { 
          success: false, 
          data: null, 
          error: "Invalid data type requested" 
        };
    }

    console.log("Admin data result:", { data_type, success: result.success });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: result.success ? 200 : 400,
      }
    );

  } catch (error) {
    console.error("Error in admin data function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});