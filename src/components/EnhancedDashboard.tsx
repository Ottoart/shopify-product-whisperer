import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModuleOverviewGrid } from '@/components/ModuleOverviewGrid';
import { SubscriptionSummary } from '@/components/subscription/SubscriptionSummary';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, TrendingUp, Warehouse, ShoppingCart, Settings, Users } from 'lucide-react';

export function EnhancedDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, email: string}>>([]);
  
  const { isAdmin } = useAdminAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription(selectedUserId);
  const { toast } = useToast();

  // Load users for admin dropdown  
  const loadUsers = async () => {
    if (!isAdmin) return;
    
    try {
      // Use auth.users metadata since profiles table may not have email
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { data_type: 'all_users' }
      });
      
      if (error) throw error;
      
      if (data?.users) {
        setAvailableUsers(data.users.map((user: any) => ({ 
          id: user.id, 
          email: user.email || user.display_name || 'No email' 
        })));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback: try to get from profiles if available
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .limit(50);
        
        if (!error && data) {
          setAvailableUsers(data.map(p => ({ id: p.user_id, email: p.display_name || 'User' })));
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
    }
  };

  // Load users when admin mode is detected
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleOpenBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-create-portal', {
        body: selectedUserId && isAdmin ? { userId: selectedUserId } : {}
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {isAdmin && selectedUserId ? 'Admin view of user dashboard' : 'Overview of your e-commerce operations and key metrics.'}
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-4">
            <Select value={selectedUserId || "current"} onValueChange={(value) => setSelectedUserId(value === "current" ? undefined : value)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select user to view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current User (You)</SelectItem>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <Users className="h-4 w-4 mr-2" />
              Refresh Users
            </Button>
          </div>
        )}
      </div>

      {/* Subscription Summary */}
      {!subscriptionLoading && subscription && (
        <SubscriptionSummary 
          subscription={subscription} 
          userId={selectedUserId}
          isAdmin={isAdmin}
        />
      )}

      {/* Module Overview Grid */}
      <ModuleOverviewGrid 
        targetUserId={selectedUserId}
        subscription={subscription}
      />
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/shipping'}>
              <Package className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/repricing'}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Review Pricing
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/send-inventory'}>
              <Warehouse className="h-4 w-4 mr-2" />
              Send Inventory
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/products'}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}