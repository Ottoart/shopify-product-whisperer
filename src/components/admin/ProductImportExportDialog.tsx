import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useStoreProductImportExport } from '@/hooks/useStoreProductImportExport';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';

interface ProductImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'import' | 'export';
  onImportComplete?: () => void;
}

export const ProductImportExportDialog = ({ 
  open, 
  onOpenChange, 
  mode,
  onImportComplete 
}: ProductImportExportDialogProps) => {
  const { exportProducts, importProducts, downloadTemplate, isExporting, isImporting } = useStoreProductImportExport();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    await exportProducts({ format: exportFormat });
    onOpenChange(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    const result = await importProducts(importFile);
    setImportResult(result);
    
    if (result.success > 0) {
      onImportComplete?.();
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'export' ? (
              <>
                <Download className="h-5 w-5" />
                Export Products
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Import Products
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export' 
              ? 'Download your product catalog in the selected format'
              : 'Upload a CSV or JSON file to add products to your store'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'export' ? (
            <>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleExport} 
                className="w-full" 
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Products
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Import File</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={downloadTemplate}
                    className="text-xs"
                  >
                    Download Template
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {importFile ? importFile.name : 'Select CSV or JSON file'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              {importFile && !importResult && (
                <Button 
                  onClick={handleImport} 
                  className="w-full" 
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Products
                    </>
                  )}
                </Button>
              )}

              {importResult && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span className="font-medium">Import Results</span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>✅ Successfully imported: {importResult.success} products</div>
                    <div>❌ Failed: {importResult.errors.length} products</div>
                    <div>📊 Total processed: {importResult.total} products</div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Errors:</div>
                      {importResult.errors.slice(0, 5).map((error: string, index: number) => (
                        <div key={index}>• {error}</div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div>... and {importResult.errors.length - 5} more errors</div>
                      )}
                    </div>
                  )}

                  <Button onClick={resetImport} variant="outline" size="sm" className="w-full">
                    Import Another File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};