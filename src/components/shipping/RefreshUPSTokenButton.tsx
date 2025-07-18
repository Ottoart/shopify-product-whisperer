import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export function RefreshUPSTokenButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-ups-token-manual');
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success("UPS token refreshed successfully!");
      } else {
        toast.error(data?.error || "Failed to refresh UPS token");
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error("Failed to refresh UPS token");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={refreshToken} 
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh UPS Token'}
    </Button>
  );
}