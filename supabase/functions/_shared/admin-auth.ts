
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function validateAdminAuth(authHeader: string) {
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user from Supabase auth instead of manual JWT decoding
  console.log('🔍 Authenticating user with Supabase auth');
  
  // Create Supabase client with the auth header
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader }
    }
  });

  let user = null;
  
  try {
    // Get authenticated user from Supabase
    const { data: { user: authUser }, error: authError } = await supabaseWithAuth.auth.getUser();

    if (authError) {
      console.error('❌ Supabase auth error:', authError.message);
      return { error: 'Authentication failed', status: 401 };
    }

    if (!authUser) {
      console.error('❌ No authenticated user found');
      return { error: 'No authenticated user', status: 401 };
    }
  console.log("authUser-----------",authUser)
    user = {
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata || {}
    };

    console.log('✅ Authenticated user from Supabase:', { 
      id: user.id,
      email: user.email,
      hasMetadata: !!user.user_metadata
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Authentication error:', errorMessage);
    return { error: `Authentication failed: ${errorMessage}`, status: 401 };
  }
  
  if (!user) {
    console.error('❌ No valid user extracted from JWT');
    return { error: 'Invalid authentication', status: 401 };
  }

  // Check if user is admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser || !['master_admin', 'admin'].includes(adminUser.role)) {
    const errorMessage = adminError ? adminError.message || String(adminError) : 'Invalid admin role';
    console.error('Admin authorization error:', errorMessage);
    return { error: 'Admin access required', status: 403 };
  }

  return { user, adminRole: adminUser.role };
}
