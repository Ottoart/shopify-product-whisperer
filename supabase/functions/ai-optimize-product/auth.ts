import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

export async function authenticateUser(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<{ id: string } | null> {
  if (!authHeader) {
    console.error('Missing authorization header');
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token length:', token.length);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error('Auth error:', userError.message);
      return null;
    }
    
    if (!authUser) {
      console.error('No user found');
      return null;
    }
    
    console.log('User authenticated:', authUser.id);
    return authUser;
  } catch (e) {
    console.error('Authentication error:', e);
    return null;
  }
}