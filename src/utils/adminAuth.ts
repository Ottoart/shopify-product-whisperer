export const clearAllAdminAuth = () => {
  // Clear admin session storage
  localStorage.removeItem('admin_session');
  sessionStorage.removeItem('admin_session');
  
  // Clear any Supabase auth keys that might interfere
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('🧹 Cleared all admin auth state');
};

export const forceAdminRefresh = () => {
  clearAllAdminAuth();
  // Force page reload to ensure clean state
  window.location.href = '/admin';
};