import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CleanupDisconnectedProductsProps {
  onCleanupComplete?: () => void;
}

export const CleanupDisconnectedProducts = ({ onCleanupComplete }: CleanupDisconnectedProductsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [orphanedProductsCount, setOrphanedProductsCount] = useState<number | null>(null);
  const { toast } = useToast();

  const checkOrphanedProducts = async () => {
    try {
      setIsLoading(true);
      
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .filter('user_id', 'in', `(
          SELECT DISTINCT p.user_id 
          FROM products p
          LEFT JOIN store_configurations sc ON (
            p.user_id = sc.user_id 
            AND p.vendor = sc.store_name 
            AND sc.is_active = true
          )
          WHERE sc.id IS NULL 
          AND p.vendor IS NOT NULL
          AND p.vendor != ''
        )`);

      if (error) throw error;
      setOrphanedProductsCount(count || 0);
    } catch (error) {
      console.error('Error checking orphaned products:', error);
      toast({
        title: "Error",
        description: "Failed to check for orphaned products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupProducts = async (cleanupType: 'soft' | 'hard') => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('cleanup-store-products', {
        body: { 
          storeId: 'all-orphaned', // Special identifier for orphaned products
          cleanupType 
        }
      });

      if (error) throw error;

      toast({
        title: "Cleanup completed",
        description: `Successfully ${cleanupType === 'hard' ? 'deleted' : 'archived'} ${data?.productsAffected || 0} orphaned products`,
      });

      setOrphanedProductsCount(0);
      onCleanupComplete?.();
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Cleanup failed",
        description: "Failed to clean up orphaned products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="h-5 w-5" />
          Disconnected Store Products
        </CardTitle>
        <CardDescription className="text-orange-700">
          Products from disconnected or inactive stores that may need cleanup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={checkOrphanedProducts}
            disabled={isLoading}
            className="border-orange-300 text-orange-800 hover:bg-orange-100"
          >
            Check for Orphaned Products
          </Button>
          {orphanedProductsCount !== null && (
            <Badge variant={orphanedProductsCount > 0 ? "destructive" : "secondary"}>
              {orphanedProductsCount} orphaned products
            </Badge>
          )}
        </div>

        {orphanedProductsCount !== null && orphanedProductsCount > 0 && (
          <div className="flex gap-2 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-800 hover:bg-orange-100">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Products
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Orphaned Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark {orphanedProductsCount} orphaned products as archived. 
                    They will still exist in the database but won't appear in your product list.
                    This action can be reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cleanupProducts('soft')}>
                    Archive Products
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Permanently Delete Orphaned Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {orphanedProductsCount} orphaned products from the database.
                    This action cannot be undone. Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => cleanupProducts('hard')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};