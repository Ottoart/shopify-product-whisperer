import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Upload, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productCount: number;
}

export function BulkWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  productCount
}: BulkWarningDialogProps) {
  const [understood, setUnderstood] = useState(false);

  const handleConfirm = () => {
    if (understood) {
      onConfirm();
      onClose();
      setUnderstood(false); // Reset for next time
    }
  };

  const handleClose = () => {
    onClose();
    setUnderstood(false); // Reset when closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div>Bulk Processing Warning</div>
              <div className="text-sm font-normal text-muted-foreground">
                This action cannot be undone
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> You are about to process <strong>{productCount} products</strong> in bulk mode.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <div>
                <div className="font-medium">Automatic Processing</div>
                <div className="text-muted-foreground">Products will be optimized using AI without manual review</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Upload className="h-3 w-3 text-primary" />
              </div>
              <div>
                <div className="font-medium">Direct Shopify Upload</div>
                <div className="text-muted-foreground">Changes will be immediately synced to your Shopify store</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-3 w-3 text-destructive" />
              </div>
              <div>
                <div className="font-medium text-destructive">Irreversible Action</div>
                <div className="text-muted-foreground">You cannot undo these changes once processing starts</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="understand" 
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked === true)}
            />
            <label 
              htmlFor="understand" 
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand this action cannot be undone and will affect {productCount} products
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!understood}
            className="bg-destructive hover:bg-destructive/90"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Start Bulk Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}