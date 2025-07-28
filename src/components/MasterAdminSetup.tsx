import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle } from "lucide-react";

export function MasterAdminSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleCreateMasterAdmin = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-master-admin');
      
      if (error) {
        throw error;
      }

      console.log('Master admin creation response:', data);
      
      // Invalidate the master admin exists query to force refetch
      await queryClient.invalidateQueries({ queryKey: ['master-admin-exists'] });
      
      toast({
        title: "Success!",
        description: "Master admin account has been created successfully.",
      });
      
      setIsCreated(true);
      
    } catch (error) {
      console.error('Error creating master admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create master admin account.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Master Admin Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>Create the master admin account for PrepFox system administration.</p>
          <p className="mt-2">
            <strong>Email:</strong> ottman1@gmail.com<br />
            <strong>Password:</strong> Prepfox00@
          </p>
        </div>
        
        {isCreated ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Master admin created successfully!</span>
          </div>
        ) : (
          <Button 
            onClick={handleCreateMasterAdmin}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create Master Admin"}
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          This action can be performed multiple times safely.
        </div>
      </CardContent>
    </Card>
  );
}