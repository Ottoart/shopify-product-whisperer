import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductImportExportDialog: React.FC<ProductImportExportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Product Import/Export
          </DialogTitle>
          <DialogDescription>
            ProductWhisper system has been removed
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              The ProductWhisper system and its import/export functionality have been removed from this application.
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};