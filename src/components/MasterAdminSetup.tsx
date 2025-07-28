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

  if (isCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Setup Complete!</CardTitle>
            <p className="text-muted-foreground">
              Master admin account has been created successfully. Please refresh the page to access the login form.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Master Admin Setup</CardTitle>
          <p className="text-muted-foreground">
            Initialize the PrepFox admin system by creating the master administrator account.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Default Credentials:</p>
            <p className="text-sm text-muted-foreground">Email: admin@prepfox.com</p>
            <p className="text-sm text-muted-foreground">Password: Auto-generated (check logs)</p>
          </div>
          
          <Button 
            onClick={handleCreateMasterAdmin}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Crown className="mr-2 h-4 w-4 animate-spin" />
                Creating Master Admin...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Initialize Admin System
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}