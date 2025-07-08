import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/pages/Index';

interface FileUploadProps {
  onFileUpload: (products: Product[]) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Product[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Create a map to group products by handle
    const productMap = new Map<string, Product>();
    
    lines.slice(1).forEach((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const rowData: any = {};
      
      headers.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });

      const handle = rowData.Handle || `product-${index}`;
      
      // If we haven't seen this handle before, create a new product
      if (!productMap.has(handle)) {
        const product: Product = {
          id: handle,
          title: rowData.Title || '',
          handle: handle,
          vendor: rowData.Vendor || '',
          type: rowData.Type || '',
          tags: rowData.Tags || '',
          published: rowData.Published === 'TRUE',
          option1Name: rowData['Option1 Name'] || '',
          option1Value: rowData['Option1 Value'] || '',
          variantSku: rowData['Variant SKU'] || '',
          variantGrams: parseFloat(rowData['Variant Grams']) || 0,
          variantInventoryTracker: rowData['Variant Inventory Tracker'] || '',
          variantInventoryQty: parseInt(rowData['Variant Inventory Qty']) || 0,
          variantInventoryPolicy: rowData['Variant Inventory Policy'] || '',
          variantFulfillmentService: rowData['Variant Fulfillment Service'] || '',
          variantPrice: parseFloat(rowData['Variant Price']) || 0,
          variantCompareAtPrice: parseFloat(rowData['Variant Compare At Price']) || 0,
          variantRequiresShipping: rowData['Variant Requires Shipping'] === 'TRUE',
          variantTaxable: rowData['Variant Taxable'] === 'TRUE',
          variantBarcode: rowData['Variant Barcode'] || '',
          imagePosition: parseInt(rowData['Image Position']) || 0,
          imageSrc: rowData['Image Src'] || '',
          bodyHtml: rowData['Body (HTML)'] || '',
          seoTitle: rowData['SEO Title'] || '',
          seoDescription: rowData['SEO Description'] || '',
          googleShoppingCondition: rowData['Google Shopping / Condition'] || '',
          googleShoppingGender: rowData['Google Shopping / Gender'] || '',
          googleShoppingAgeGroup: rowData['Google Shopping / Age Group'] || '',
        };
        
        productMap.set(handle, product);
      } else {
        // Product already exists, we can update certain fields if needed
        const existingProduct = productMap.get(handle)!;
        
        // If this row has an image and the existing product doesn't, use this image
        if (rowData['Image Src'] && !existingProduct.imageSrc) {
          existingProduct.imageSrc = rowData['Image Src'];
          existingProduct.imagePosition = parseInt(rowData['Image Position']) || 0;
        }
        
        // Merge tags if different
        if (rowData.Tags && rowData.Tags !== existingProduct.tags) {
          const existingTags = existingProduct.tags ? existingProduct.tags.split(',').map(t => t.trim()) : [];
          const newTags = rowData.Tags.split(',').map(t => t.trim());
          const allTags = [...new Set([...existingTags, ...newTags])];
          existingProduct.tags = allTags.join(', ');
        }
      }
    });
    
    return Array.from(productMap.values());
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const products = parseCSV(text);
      
      if (products.length === 0) {
        setError('No valid products found in the CSV file');
        return;
      }

      onFileUpload(products);
    } catch (err) {
      setError('Error parsing CSV file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-primary/2'
          }
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragging ? 'bg-gradient-primary' : 'bg-gradient-secondary'
          }`}>
            {isProcessing ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <FileText className={`h-8 w-8 ${isDragging ? 'text-primary-foreground' : 'text-primary'}`} />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isProcessing ? 'Processing CSV...' : 'Upload Shopify Products CSV'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>
          
          <Button 
            variant="outline" 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="transition-all duration-300 hover:scale-105"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};