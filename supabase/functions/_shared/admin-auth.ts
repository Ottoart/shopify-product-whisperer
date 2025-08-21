import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function validateAdminAuth(authHeader: string) {
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user from JWT - handle both standard Supabase JWT and admin JWT
  const jwt = authHeader.replace('Bearer ', '');
  let user = null;
  
  console.log('🔍 Processing JWT token (first 20 chars):', jwt.substring(0, 20));
  
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
      
      const payload = JSON.parse(atob(payloadB64));
      console.log('🔓 Decoded admin JWT payload:', { 
        sub: payload.sub, 
        email: payload.email,
        iss:"supabase",
        aud: payload.aud,
        exp: payload.exp
      });
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.error('❌ Admin JWT token expired');
        return { error: 'Token expired', status: 401 };
      }
      
      if (payload.sub && payload.email) {
        user = {
          id: payload.sub,
          email: payload.email,
          user_metadata: payload.user_metadata || {}
        };
        console.log('✅ Using admin session JWT for user:', user.email);
      }
    } else {
      console.error('❌ Invalid JWT format - expected 3 parts separated by dots');
      return { error: 'Invalid token format', status: 401 };
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
  
  if (!user) {
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
    console.error('Admin authorization error:', adminError);
    return { error: 'Admin access required', status: 403 };
  }

  return { user, adminRole: adminUser.role };
}