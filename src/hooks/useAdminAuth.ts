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
  jwt_token?: string;
}

const ADMIN_SESSION_KEY = 'admin_session';

export function useAdminAuth() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = (session: AdminSession): boolean => {
    if (!session || !session.user || !session.expires_at) {
      return false;
    }
    return new Date(session.expires_at) > new Date();
  };

  const loadSession = () => {
    try {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (validateSession(session)) {
          setAdminSession(session);
          return true;
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Error parsing admin session:', error);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    return false;
  };

  useEffect(() => {
    const sessionLoaded = loadSession();
    setIsLoading(false);
    
    if (sessionLoaded) {
      console.log('✅ Admin session loaded');
    } else {
      console.log('❌ No valid admin session found');
    }
  }, []);

  // Simple session validation check every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (currentSession) {
        try {
          const session = JSON.parse(currentSession);
          if (!validateSession(session)) {
            console.warn('Admin session expired, clearing...');
            setAdminSession(null);
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        } catch (error) {
          console.error('Error validating session:', error);
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting admin sign-in for:', email);
      
      // Clear any existing session first to ensure fresh token
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setAdminSession(null);
      
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { email, password }
      });

      if (error) {
        console.error('❌ Admin auth function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('❌ Admin auth failed:', data.error);
        throw new Error(data.error || 'Authentication failed');
      }

      const session = data.session;
      console.log('✅ Admin auth successful:', { 
        userId: session.user.id, 
        email: session.user.email,
        hasJwtToken: !!session.jwt_token,
        jwtTokenPreview: session.jwt_token?.substring(0, 50) + '...'
      });

      if (!validateSession(session)) {
        throw new Error('Invalid session received');
      }

      setAdminSession(session);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Admin sign-in error:', error);
      setAdminSession(null);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setAdminSession(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  // Simple authentication checks
  const isAuthenticated = !isLoading && adminSession !== null && 
    (adminSession ? new Date(adminSession.expires_at) > new Date() : false);

  const hasRole = (role: string) => {
    return adminSession?.user.role === role;
  };

  const isMasterAdmin = adminSession?.user.role === 'master_admin';

  const isAdmin = adminSession?.user.role && 
    ['master_admin', 'admin', 'manager'].includes(adminSession.user.role);

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