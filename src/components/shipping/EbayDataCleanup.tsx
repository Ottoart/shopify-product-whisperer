import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';

export const EbayDataCleanup = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-ebay-data');
      
      if (error) throw error;

      toast({
        title: "Cleanup completed",
        description: `Cleaned ${data.cleaned_products} products and ${data.cleaned_order_items} order items. Found ${data.current_ebay_orders} current eBay orders.`,
      });

      console.log('Cleanup results:', data);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleEbaySync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { storeName: 'ebay' }
      });
      
      if (error) throw error;

      toast({
        title: "eBay sync completed",
        description: `Synced ${data.totalSynced || 0} orders`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          eBay Data Management
        </CardTitle>
        <CardDescription>
          Clean up corrupted eBay data and trigger fresh sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCleanup} 
          disabled={isCleaningUp}
          variant="outline"
          className="w-full"
        >
          {isCleaningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Clean Up Corrupted Data
        </Button>
        
        <Button 
          onClick={handleEbaySync} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync eBay Orders
        </Button>
      </CardContent>
    </Card>
  );
};