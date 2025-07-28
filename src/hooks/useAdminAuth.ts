import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSession {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: any;
    display_name: string;
  };
  expires_at: string;
  session_id: string;
  supabase_session?: string | null;
}

const ADMIN_SESSION_KEY = 'admin_session';

export function useAdminAuth() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (new Date(session.expires_at) > new Date()) {
          setAdminSession(session);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { email, password }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const session = data.session;
      
      // Set up Supabase Auth session if provided
      if (session.supabase_session) {
        try {
          await supabase.auth.setSession({
            access_token: session.supabase_session,
            refresh_token: session.supabase_session
          });
        } catch (authError) {
          console.warn('Failed to set Supabase auth session:', authError);
        }
      }
      
      setAdminSession(session);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      
      return { success: true };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  };

  const signOut = async () => {
    // Clear Supabase Auth session
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Failed to sign out of Supabase auth:', error);
    }
    
    // Clear admin session
    setAdminSession(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  // Reactive computed values that will trigger re-renders
  const isAuthenticated = adminSession !== null && 
    (adminSession ? new Date(adminSession.expires_at) > new Date() : false);

  const hasRole = (role: string) => {
    return adminSession?.user.role === role;
  };

  const isMasterAdmin = adminSession?.user.role === 'master_admin';

  const isAdmin = adminSession?.user.role && 
    ['master_admin', 'admin', 'manager'].includes(adminSession.user.role);

  // Add debug logging
  console.log('useAdminAuth state:', {
    hasSession: !!adminSession,
    isAuthenticated,
    isAdmin,
    userRole: adminSession?.user.role
  });

  return {
    adminSession,
    isLoading,
    signIn,
    signOut,
    isAuthenticated,
    hasRole,
    isMasterAdmin,
    isAdmin,
  };
}