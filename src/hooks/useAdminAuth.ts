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
  supabase_session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  } | null;
}

const ADMIN_SESSION_KEY = 'admin_session';

export function useAdminAuth() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStable, setSessionStable] = useState(false);

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
          setSessionStable(true);
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
  }, []);

  // Simplified session validation - only check every 5 minutes and be less aggressive
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (currentSession) {
        try {
          const session = JSON.parse(currentSession);
          // Only clear if session is truly expired (with 1 hour buffer)
          const expiryTime = new Date(session.expires_at);
          const now = new Date();
          const oneHourBuffer = 60 * 60 * 1000;
          
          if (expiryTime.getTime() < (now.getTime() - oneHourBuffer)) {
            console.warn('Admin session truly expired, clearing...');
            setAdminSession(null);
            setSessionStable(false);
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        } catch (error) {
          console.error('Error validating session:', error);
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    }, 300000); // Check every 5 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { email, password }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const session = data.session;
      
      if (!validateSession(session)) {
        throw new Error('Invalid session received from server');
      }
      
      setAdminSession(session);
      setSessionStable(true);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      
      return { success: true };
    } catch (error) {
      console.error('Admin sign in error:', error);
      setSessionStable(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Failed to sign out of Supabase auth:', error);
    }
    
    setAdminSession(null);
    setSessionStable(false);
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
    sessionStable,
    signIn,
    signOut,
    isAuthenticated,
    hasRole,
    isMasterAdmin,
    isAdmin,
  };
}