
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

  // Get user from JWT - handle both standard Supabase JWT and admin JWT
  const jwt = authHeader.replace('Bearer ', '').trim();
  let user = null;
  
  console.log('🔍 Processing JWT token (first 20 chars):', jwt.substring(0, 20));
  
  // Check if this is the anon key (which is invalid for admin auth)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  // if (jwt === anonKey) {
  //   console.error('❌ Anon key provided instead of admin JWT');
  //   return { error: 'Invalid authentication - use admin session token', status: 401 };
  // }
  
  try {
    // Handle admin session JWT - decode JWT payload
    const parts = jwt.split('.');
    if (parts.length === 3) {
      // Decode the payload (second part)
      // Add padding if needed for proper base64 decoding
      let payloadB64 = parts[1];
      while (payloadB64.length % 4) {
        payloadB64 += '=';
      }
      
      // Properly decode the JWT payload dynamically
      const payload = JSON.parse(atob(payloadB64));
    const authHeader = req.headers.get('Authorization');

    const supabase1 = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });
      const { data: { adminuser }, error: authError } = await supabase1.auth.getUser();
      console.log('🔓 Decoded admin JWT payload:', { 
        sub: payload.sub, 
        email: payload.email,
        iss: payload.iss,
        aud: payload.aud,
        exp: payload.exp,
        user_metadata: !!payload.user_metadata,
        supabase1:adminuser
      });
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.error('❌ Admin JWT token expired');
        return { error: 'Token expired', status: 401 };
      }
      
      // Validate required claims
      if (!payload.sub || !payload.email) {
        console.error('❌ Missing required JWT claims:', { 
          hasSub: !!payload.sub, 
          hasEmail: !!payload.email,
          allKeys: Object.keys(payload)
        });
        return { error: 'Invalid JWT - missing user claims', status: 401 };
      }
      
      user = {
        id: payload.sub,
        email: payload.email,
        user_metadata: payload.user_metadata || {}
      };
      console.log('✅ Using admin session JWT for user:', user.email);
    } else {
      console.error('❌ Invalid JWT format - expected 3 parts separated by dots, got:', parts.length);
      return { error: 'Invalid token format', status: 401 };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ JWT decode error:', errorMessage, 'Token:', jwt.substring(0, 50) + '...');
    return { error: `JWT decode failed: ${errorMessage}`, status: 401 };
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
