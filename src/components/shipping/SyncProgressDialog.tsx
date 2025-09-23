import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Minimize2, Package, Store } from "lucide-react";

interface SyncProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueBackground: () => void;
  syncData?: {
    message?: string;
    synced: number;
    results?: Array<{
      store: string;
      synced?: number;
      error?: string;
    }>;
  };
  isCompleted: boolean;
  isError: boolean;
}

const syncingMessages = [
  "🔍 Discovering your stores...",
  "🌐 Connecting to Shopify API...",
  "📦 Fetching your latest orders...",
  "🔄 Processing order data...",
  "💾 Saving orders to database...",
  "✨ Almost there, finalizing sync...",
];

const completedMessages = [
  "🎉 All done! Your orders are now up to date",
  "✅ Sync completed successfully!",
  "🚀 Your order data is fresh and ready",
  "💫 Perfect! Everything is synchronized",
];

export function SyncProgressDialog({
  open,
  onOpenChange,
  onContinueBackground,
  syncData,
  isCompleted,
  isError
}: SyncProgressDialogProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open || isCompleted || isError) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % syncingMessages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [open, isCompleted, isError]);

  useEffect(() => {
    if (isCompleted) {
      setProgress(100);
    }
  }, [isCompleted]);

  const getRandomCompletedMessage = () => {
    return completedMessages[Math.floor(Math.random() * completedMessages.length)];
  };

  const handleContinueBackground = () => {
    onContinueBackground();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? (
              <Check className="h-5 w-5 text-success" />
            ) : isError ? (
              <X className="h-5 w-5 text-destructive" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {isCompleted ? "Sync Complete!" : isError ? "Sync Failed" : "Syncing Orders"}
          </DialogTitle>
          <DialogDescription>
            {isCompleted 
              ? getRandomCompletedMessage()
              : isError 
              ? "There was an issue syncing your orders. Please check your store configuration."
              : syncingMessages[currentMessageIndex]
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 animate-fade-in"
            />
          </div>

          {/* Sync Stats */}
          {syncData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary">
                  {syncData.synced || 0}
                </div>
                <div className="text-sm text-muted-foreground">Orders Synced</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary">
                  {syncData.results?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Stores Processed</div>
              </div>
            </div>
          )}

          {/* Store Results */}
          {syncData?.results && syncData.results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Store Status</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {syncData.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <span className="font-medium">{result.store}</span>
                    {result.error ? (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        {result.synced || 0} orders
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isCompleted && !isError ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleContinueBackground}
                  className="flex-1 hover-scale"
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Continue in Background
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => onOpenChange(false)}
                  className="hover-scale"
                >
                  Wait Here
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => onOpenChange(false)}
                className="w-full hover-scale"
                variant={isError ? "destructive" : "default"}
              >
                {isError ? "Close" : "Done"}
              </Button>
            )}
          </div>

          {!isCompleted && !isError && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: You can minimize this and continue working. The sync will complete in the background!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}