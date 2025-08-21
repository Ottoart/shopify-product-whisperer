import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Store, 
  Package, 
  Settings, 
  ArrowRight,
  X,
  Rocket
} from "lucide-react";
import { ConnectStoreButton } from "./ConnectStoreButton";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action?: React.ReactNode;
}

export function WelcomeBanner() {
  const user = { id: 'demo-user-id' };
  const [isVisible, setIsVisible] = useState(true);
  const [storeCount, setStoreCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    if (user) {
      checkSetupStatus();
    }
  }, [user]);

  const checkSetupStatus = async () => {
    if (!user) return;

    // Check connected stores
    const { data: stores } = await supabase
      .from('store_configurations')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    setStoreCount(stores?.length || 0);

    // Check products
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    setProductCount(products?.length || 0);

    // Check profile completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, company_name')
      .eq('user_id', user.id)
      .single();
    
    setProfileComplete(Boolean(profile?.display_name || profile?.company_name));
  };

  const setupSteps: SetupStep[] = [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add your name and company details",
      icon: Settings,
      completed: profileComplete,
      action: (
        <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings'}>
          Complete Profile
        </Button>
      )
    },
    {
      id: "store",
      title: "Connect your first store",
      description: "Link your Shopify, eBay, or other marketplace account",
      icon: Store,
      completed: storeCount > 0,
      action: <ConnectStoreButton size="sm" onStoreConnected={checkSetupStatus} />
    },
    {
      id: "products",
      title: "Sync your products",
      description: "Import your product catalog to start optimizing",
      icon: Package,
      completed: productCount > 0,
      action: storeCount > 0 ? (
        <Button size="sm" variant="outline" onClick={() => window.location.href = '/shopify-integration'}>
          Sync Products
        </Button>
      ) : null
    }
  ];

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const progress = (completedSteps / setupSteps.length) * 100;
  const isSetupComplete = completedSteps === setupSteps.length;

  // Hide banner if setup is complete or user dismissed it
  if (!isVisible || isSetupComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Welcome to PrepFox!</CardTitle>
              <CardDescription>
                Let's get your account set up in just a few quick steps
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <Badge variant="outline">{completedSteps} of {setupSteps.length} completed</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {setupSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  step.completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    step.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Complete
                    </Badge>
                  ) : (
                    step.action && (
                      <div className="flex items-center gap-2">
                        {step.action}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {completedSteps > 0 && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">🎉 Great progress!</h4>
            <p className="text-sm text-muted-foreground">
              {completedSteps === 1 && "You've completed your first setup step. Keep going!"}
              {completedSteps === 2 && "Almost there! Just one more step to complete your setup."}
              {completedSteps === setupSteps.length && "Setup complete! You're ready to start managing your products."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}