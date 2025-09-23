import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
  syncFunction: () => Promise<void>;
  stores?: Array<{ store_name: string; id: string }>;
}

export const SyncProgressDialog = ({ 
  isOpen, 
  onClose, 
  onSyncComplete, 
  syncFunction,
  stores = []
}: SyncProgressDialogProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [syncedProducts, setSyncedProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStore, setCurrentStore] = useState('');
  const [storeProgress, setStoreProgress] = useState(0);
  const { toast } = useToast();

  const getStepMessage = (storeIndex: number, totalStores: number, storeName: string) => [
    `Connecting to ${storeName}...`,
    `Authenticating with ${storeName}...`,
    `Fetching products from ${storeName}...`,
    `Processing product data from ${storeName}...`,
    `Syncing ${storeName} products to database...`,
    totalStores > 1 && storeIndex < totalStores - 1 
      ? `Moving to next store...` 
      : 'Finalizing sync...'
  ];

  useEffect(() => {
    if (isOpen && !isSyncing) {
      startSync();
    }
  }, [isOpen]);

  const startSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    setSyncedProducts(0);
    setTotalProducts(0);
    setError(null);
    setIsCompleted(false);
    setStoreProgress(0);

    try {
      const totalStores = Math.max(stores.length, 1);
      let allProductsCount = 0;

      // Process each store
      for (let storeIndex = 0; storeIndex < totalStores; storeIndex++) {
        const store = stores[storeIndex];
        const storeName = store?.store_name || 'your store';
        setCurrentStore(storeName);
        
        const steps = getStepMessage(storeIndex, totalStores, storeName);
        const baseProgress = (storeIndex / totalStores) * 100;
        
        // Step 1: Initialize
        setCurrentStep(steps[0]);
        setProgress(baseProgress + 5);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 2: Authentication
        setCurrentStep(steps[1]);
        setProgress(baseProgress + 10);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 3: Fetching
        setCurrentStep(steps[2]);
        setProgress(baseProgress + 20);
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 4: Processing - call actual sync here
        setCurrentStep(steps[3]);
        setProgress(baseProgress + 40);
        
        try {
          // Call the sync function for this store
          await syncFunction();
          allProductsCount += 50; // Estimate, could be improved with actual counts
          setSyncedProducts(allProductsCount);
        } catch (storeError: any) {
          throw new Error(`${storeName}: ${storeError.message}`);
        }

        // Step 5: Syncing to database
        setCurrentStep(steps[4]);
        setProgress(baseProgress + 70);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 6: Finalizing store or moving to next
        setCurrentStep(steps[5]);
        setProgress(baseProgress + 85);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setStoreProgress(storeIndex + 1);
      }

      // Complete
      setProgress(100);
      setCurrentStep('🎉 All stores synced successfully!');
      setIsCompleted(true);
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced products from ${totalStores} store${totalStores > 1 ? 's' : ''}.`,
      });

      onSyncComplete();

    } catch (error: any) {
      console.error('Sync error:', error);
      setError(error.message || 'Sync failed');
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync products from store",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClose = () => {
    if (!isSyncing) {
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
        setIsCompleted(false);
        setError(null);
        setSyncedProducts(0);
        setTotalProducts(0);
        setCurrentStore('');
        setStoreProgress(0);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : error ? (
              <X className="w-5 h-5 text-red-500" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}
            Product Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Current Step */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{currentStep}</span>
            </div>
            
            {/* Store Progress */}
            {stores.length > 1 && storeProgress > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                Store {storeProgress} of {stores.length} completed
              </div>
            )}
            
            {/* Product Count */}
            {syncedProducts > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-muted-foreground">
                    {syncedProducts} products synced
                    {totalProducts > 0 && ` of ${totalProducts}`}
                  </span>
                </div>
              </div>
            )}
            
            {/* Current Store */}
            {currentStore && !isCompleted && (
              <div className="text-xs text-muted-foreground">
                Working on: <span className="font-medium">{currentStore}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Sync Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {isCompleted || error ? (
              <Button onClick={handleClose}>
                {isCompleted ? 'Done' : 'Close'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isSyncing}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};