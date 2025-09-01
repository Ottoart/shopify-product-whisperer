import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: any;
  display_name?: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupAuthState = () => {
    // Clear all auth-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    setSession(null);
    setAdminUser(null);
  };

  const checkAdminStatus = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('User is not an admin:', error?.message);
        return null;
      }

      return {
        id: currentUser.id,
        email: currentUser.email || '',
        role: data.role,
        permissions: data.permissions,
        display_name: currentUser.user_metadata?.display_name || currentUser.email
      };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          const adminData = await checkAdminStatus(session.user);
          setAdminUser(adminData);
        } else {
          setAdminUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminData = await checkAdminStatus(session.user);
        setAdminUser(adminData);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      // Check if user is admin
      const adminData = await checkAdminStatus(data.user);
      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error('Access denied: Admin privileges required');
      }

      setUser(data.user);
      setSession(data.session);
      setAdminUser(adminData);

      return { success: true };
    } catch (error) {
      console.error('Admin sign in error:', error);
      cleanupAuthState();
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
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clean up even if sign out fails
      cleanupAuthState();
      window.location.href = '/admin';
    }
  };

  const isAuthenticated = !isLoading && session !== null && user !== null && adminUser !== null;

  const hasRole = (role: string) => {
    return adminUser?.role === role;
  };

  const isMasterAdmin = adminUser?.role === 'master_admin';

  const isAdmin = adminUser?.role && 
    ['master_admin', 'admin', 'manager'].includes(adminUser.role);

  return {
    user,
    session,
    adminUser,
    isLoading,
    signIn,
    signOut,
    isAuthenticated,
    hasRole,
    isMasterAdmin,
    isAdmin,
  };
}