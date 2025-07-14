import React from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles } from 'lucide-react';

export function WelcomeBanner() {
  const { user } = useAuth();
  
  // Extract display name from user metadata or use email
  const displayName = user?.user_metadata?.display_name || 
                     user?.email?.split('@')[0] || 
                     'there';

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 mb-6">
      <div className="p-4 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Hi {displayName}, welcome back! Let's make today efficient. ✨
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ready to optimize your business? Your dashboard is updated and waiting for you.
          </p>
        </div>
      </div>
    </Card>
  );
}