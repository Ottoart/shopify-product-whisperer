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
    
    console.log('CSV Headers found:', headers);
    
    // Create a map to group products by handle
    const productMap = new Map<string, Product>();
    
    lines.slice(1).forEach((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const rowData: any = {};
      
      headers.forEach((header, i) => {
        rowData[header] = values[i] || '';
      });

      const handle = rowData.Handle || rowData.handle || `product-${index}`;
      const title = rowData.Title || rowData.title || rowData['Product Title'] || rowData['Product Name'] || '';
      
      // Debug log for first few products
      if (index < 3) {
        console.log(`Row ${index}:`, {
          handle,
          title,
          rawRowData: rowData
        });
      }
      
      // If we haven't seen this handle before, create a new product
      if (!productMap.has(handle)) {
        const product: Product = {
          id: handle,
          title: title,
          handle: handle,
          vendor: rowData.Vendor || rowData.vendor || '',
          type: rowData.Type || rowData.type || rowData['Product Type'] || '',
          tags: rowData.Tags || rowData.tags || '',
          published: (rowData.Published || rowData.published || '').toString().toUpperCase() === 'TRUE',
          option1Name: rowData['Option1 Name'] || rowData['Option 1 Name'] || '',
          option1Value: rowData['Option1 Value'] || rowData['Option 1 Value'] || '',
          variantSku: rowData['Variant SKU'] || rowData['SKU'] || '',
          variantGrams: parseFloat(rowData['Variant Grams'] || rowData['Weight'] || '0') || 0,
          variantInventoryTracker: rowData['Variant Inventory Tracker'] || '',
          variantInventoryQty: parseInt(rowData['Variant Inventory Qty'] || rowData['Inventory'] || '0') || 0,
          variantInventoryPolicy: rowData['Variant Inventory Policy'] || '',
          variantFulfillmentService: rowData['Variant Fulfillment Service'] || '',
          variantPrice: parseFloat(rowData['Variant Price'] || rowData['Price'] || '0') || 0,
          variantCompareAtPrice: parseFloat(rowData['Variant Compare At Price'] || rowData['Compare At Price'] || '0') || 0,
          variantRequiresShipping: (rowData['Variant Requires Shipping'] || '').toString().toUpperCase() === 'TRUE',
          variantTaxable: (rowData['Variant Taxable'] || '').toString().toUpperCase() === 'TRUE',
          variantBarcode: rowData['Variant Barcode'] || rowData['Barcode'] || '',
          imagePosition: parseInt(rowData['Image Position'] || '0') || 0,
          imageSrc: rowData['Image Src'] || rowData['Image URL'] || rowData['Image'] || '',
          bodyHtml: rowData['Body (HTML)'] || rowData['Description'] || rowData['Body'] || '',
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
        const imageUrl = rowData['Image Src'] || rowData['Image URL'] || rowData['Image'] || '';
        if (imageUrl && !existingProduct.imageSrc) {
          existingProduct.imageSrc = imageUrl;
          existingProduct.imagePosition = parseInt(rowData['Image Position'] || '0') || 0;
        }
        
        // Merge tags if different
        const tags = rowData.Tags || rowData.tags || '';
        if (tags && tags !== existingProduct.tags) {
          const existingTags = existingProduct.tags ? existingProduct.tags.split(',').map(t => t.trim()) : [];
          const newTags = tags.split(',').map(t => t.trim());
          const allTags = [...new Set([...existingTags, ...newTags])];
          existingProduct.tags = allTags.join(', ');
        }
      }
    });
    
    const products = Array.from(productMap.values());
    console.log(`Parsed ${products.length} unique products from ${lines.length - 1} CSV rows`);
    
    return products;
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