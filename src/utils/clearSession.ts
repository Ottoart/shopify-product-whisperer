import { supabase } from "@/integrations/supabase/client";

// Function to clear any existing session
export const clearExistingSession = async () => {
  try {
    await supabase.auth.signOut();
    // Clear localStorage
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    console.log("Session cleared successfully");
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

// Auto-execute on import
//clearExistingSession();