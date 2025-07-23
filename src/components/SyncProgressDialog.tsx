import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
  syncFunction: () => Promise<void>;
}

export const SyncProgressDialog = ({ 
  isOpen, 
  onClose, 
  onSyncComplete, 
  syncFunction 
}: SyncProgressDialogProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [syncedProducts, setSyncedProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const steps = [
    'Connecting to your store...',
    'Authenticating with Shopify...',
    'Fetching product catalog...',
    'Processing product data...',
    'Syncing to database...',
    'Finalizing sync...'
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

    try {
      // Step 1: Initialize
      setCurrentStep(steps[0]);
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Authentication
      setCurrentStep(steps[1]);
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Start actual sync
      setCurrentStep(steps[2]);
      setProgress(30);
      
      // Call the actual sync function
      await syncFunction();

      // Simulate progress updates for remaining steps
      setCurrentStep(steps[3]);
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep(steps[4]);
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep(steps[5]);
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Complete
      setProgress(100);
      setCurrentStep('Sync completed successfully!');
      setIsCompleted(true);
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${syncedProducts} products from your store.`,
      });

      onSyncComplete();

    } catch (error: any) {
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{currentStep}</span>
            </div>
            
            {syncedProducts > 0 && (
              <div className="text-sm text-muted-foreground">
                Synced {syncedProducts} {totalProducts > 0 && `of ${totalProducts}`} products
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
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