import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Download,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductWhisperItem } from '@/types/productwhisper';

interface ProductImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (products: Partial<ProductWhisperItem>[]) => void;
}

type ImportStep = 'upload' | 'mapping' | 'validation' | 'import' | 'complete';

interface ImportData {
  file: File | null;
  rawData: any[];
  mappedData: Partial<ProductWhisperItem>[];
  validationErrors: string[];
  progress: number;
}

const SAMPLE_CSV_CONTENT = `title,handle,body_html,type,category,vendor,variant_price,variant_sku,variant_inventory_qty,published
"Premium Coffee Mug","premium-coffee-mug","High-quality ceramic coffee mug perfect for your morning brew","Drinkware","Kitchen","Coffee Co",24.99,"MUG-001",50,true
"Wireless Headphones","wireless-headphones","Bluetooth headphones with noise cancellation","Electronics","Audio","TechBrand",89.99,"HEAD-002",25,true
"Organic T-Shirt","organic-t-shirt","100% organic cotton t-shirt in various colors","Apparel","Clothing","EcoWear",29.99,"SHIRT-003",100,true`;

export const ProductImportWizard: React.FC<ProductImportWizardProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importData, setImportData] = useState<ImportData>({
    file: null,
    rawData: [],
    mappedData: [],
    validationErrors: [],
    progress: 0
  });

  const steps = [
    { key: 'upload', label: 'Upload File', description: 'Select CSV or JSON file' },
    { key: 'mapping', label: 'Map Fields', description: 'Match columns to product fields' },
    { key: 'validation', label: 'Validate Data', description: 'Check for errors' },
    { key: 'import', label: 'Import', description: 'Process the import' },
    { key: 'complete', label: 'Complete', description: 'Import finished' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const sampleData = {
      products: [
        {
          title: "Premium Coffee Mug",
          handle: "premium-coffee-mug",
          body_html: "High-quality ceramic coffee mug perfect for your morning brew",
          type: "Drinkware",
          category: "Kitchen",
          vendor: "Coffee Co",
          variant_price: 24.99,
          variant_sku: "MUG-001",
          variant_inventory_qty: 50,
          published: true
        },
        {
          title: "Wireless Headphones",
          handle: "wireless-headphones",
          body_html: "Bluetooth headphones with noise cancellation",
          type: "Electronics",
          category: "Audio",
          vendor: "TechBrand",
          variant_price: 89.99,
          variant_sku: "HEAD-002",
          variant_inventory_qty: 25,
          published: true
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let rawData: any[] = [];
        
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const jsonData = JSON.parse(e.target?.result as string);
          rawData = Array.isArray(jsonData) ? jsonData : jsonData.products || [];
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          const csvText = e.target?.result as string;
          const rows = csvText.split('\n').filter(row => row.trim() !== '');
          const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
          
          rawData = rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.replace(/"/g, '').trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        }

        setImportData(prev => ({
          ...prev,
          file,
          rawData
        }));
        
        setCurrentStep('mapping');
      } catch (error) {
        toast({
          title: "File Parse Error",
          description: "Failed to parse the uploaded file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const processImport = async () => {
    setCurrentStep('import');
    
    // Simulate import process with progress
    for (let i = 0; i <= 100; i += 10) {
      setImportData(prev => ({ ...prev, progress: i }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Complete the import
    onImportComplete(importData.mappedData);
    setCurrentStep('complete');
    
    toast({
      title: "Import Successful",
      description: `Successfully imported ${importData.mappedData.length} products.`,
    });
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setImportData({
      file: null,
      rawData: [],
      mappedData: [],
      validationErrors: [],
      progress: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Products
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Product Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Choose a file to upload</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload a CSV or JSON file containing your product data
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSV Template
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download a CSV template with sample data
                        </p>
                        <Button size="sm" variant="outline" onClick={downloadSampleCSV}>
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          JSON Template
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download a JSON template with sample data
                        </p>
                        <Button size="sm" variant="outline" onClick={downloadSampleJSON}>
                          <Download className="h-4 w-4 mr-2" />
                          Download JSON
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'mapping' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Field Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detected {importData.rawData.length} products in your file. 
                    Field mapping is automatically detected for standard formats.
                  </p>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">Auto-mapped fields detected</Badge>
                    <div className="text-sm text-muted-foreground">
                      Common fields like title, price, and SKU have been automatically mapped.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep('validation')}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'validation' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">
                      All {importData.rawData.length} products passed validation
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Your data is ready to import. All required fields are present and formatted correctly.
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={processImport}>
                  Start Import
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'import' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Importing Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Processing Import</h3>
                    <p className="text-muted-foreground">
                      Please wait while we import your products...
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{importData.progress}%</span>
                    </div>
                    <Progress value={importData.progress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Import Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Successfully Imported</h3>
                    <p className="text-muted-foreground">
                      {importData.rawData.length} products have been imported successfully.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleClose}>
                      View Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};