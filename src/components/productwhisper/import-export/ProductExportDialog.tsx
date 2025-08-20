import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database, CheckCircle } from 'lucide-react';
import { ProductWhisperItem } from '@/types/productwhisper';
import { useToast } from '@/hooks/use-toast';

interface ProductExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductWhisperItem[];
  selectedProducts?: Set<string>;
}

interface ExportField {
  key: keyof ProductWhisperItem;
  label: string;
  category: string;
  description?: string;
}

const exportFields: ExportField[] = [
  // Basic Info
  { key: 'title', label: 'Title', category: 'Basic Info' },
  { key: 'handle', label: 'Handle', category: 'Basic Info' },
  { key: 'body_html', label: 'Description', category: 'Basic Info' },
  { key: 'type', label: 'Product Type', category: 'Basic Info' },
  { key: 'category', label: 'Category', category: 'Basic Info' },
  { key: 'vendor', label: 'Vendor', category: 'Basic Info' },
  { key: 'tags', label: 'Tags', category: 'Basic Info' },
  { key: 'published', label: 'Published Status', category: 'Basic Info' },

  // Pricing & Inventory
  { key: 'variant_price', label: 'Price', category: 'Pricing & Inventory' },
  { key: 'variant_compare_at_price', label: 'Compare at Price', category: 'Pricing & Inventory' },
  { key: 'variant_sku', label: 'SKU', category: 'Pricing & Inventory' },
  { key: 'variant_inventory_qty', label: 'Inventory Quantity', category: 'Pricing & Inventory' },
  { key: 'variant_inventory_policy', label: 'Inventory Policy', category: 'Pricing & Inventory' },
  { key: 'variant_barcode', label: 'Barcode', category: 'Pricing & Inventory' },

  // SEO & Marketing
  { key: 'seo_title', label: 'SEO Title', category: 'SEO & Marketing' },
  { key: 'seo_description', label: 'SEO Description', category: 'SEO & Marketing' },

  // Product Details
  { key: 'variant_grams', label: 'Weight (grams)', category: 'Product Details' },
  { key: 'variant_requires_shipping', label: 'Requires Shipping', category: 'Product Details' },
  { key: 'variant_taxable', label: 'Taxable', category: 'Product Details' },

  // Google Shopping
  { key: 'google_shopping_condition', label: 'Condition', category: 'Google Shopping' },
  { key: 'google_shopping_gender', label: 'Gender', category: 'Google Shopping' },
  { key: 'google_shopping_age_group', label: 'Age Group', category: 'Google Shopping' },

  // Media & Meta
  { key: 'image_src', label: 'Image URL', category: 'Media & Meta' },
  { key: 'updated_at', label: 'Last Updated', category: 'Media & Meta' },
];

export const ProductExportDialog: React.FC<ProductExportDialogProps> = ({
  isOpen,
  onClose,
  products,
  selectedProducts
}) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(['title', 'handle', 'variant_price', 'variant_inventory_qty', 'published'])
  );
  const [exportScope, setExportScope] = useState<'all' | 'selected' | 'filtered'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const productsToExport = exportScope === 'selected' && selectedProducts
    ? products.filter(p => selectedProducts.has(p.id))
    : products;

  const toggleField = (fieldKey: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const selectAllFields = () => {
    setSelectedFields(new Set(exportFields.map(f => f.key)));
  };

  const selectEssentialFields = () => {
    setSelectedFields(new Set([
      'title', 'handle', 'body_html', 'type', 'category', 'vendor',
      'variant_price', 'variant_sku', 'variant_inventory_qty', 'published'
    ]));
  };

  const clearSelection = () => {
    setSelectedFields(new Set());
  };

  const exportToCSV = (data: ProductWhisperItem[], fields: string[]) => {
    const headers = fields.map(field => 
      exportFields.find(f => f.key === field)?.label || field
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(product => 
        fields.map(field => {
          const value = product[field as keyof ProductWhisperItem];
          // Escape commas and quotes in CSV
          const fieldValue = product[field as keyof ProductWhisperItem] as any;
          if (typeof fieldValue === 'string' && (fieldValue.includes(',') || fieldValue.includes('"'))) {
            return `"${fieldValue.replace(/"/g, '""')}"`;
          }
          return fieldValue?.toString() || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: ProductWhisperItem[], fields: string[]) => {
    const filteredData = data.map(product => {
      const filtered: any = {};
      fields.forEach(field => {
        filtered[field] = product[field as keyof ProductWhisperItem];
      });
      return filtered;
    });

    const jsonContent = JSON.stringify({
      exported_at: new Date().toISOString(),
      total_products: filteredData.length,
      fields: fields,
      products: filteredData
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedFields.size === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const fields = Array.from(selectedFields);
      
      if (exportFormat === 'csv') {
        exportToCSV(productsToExport, fields);
      } else {
        exportToJSON(productsToExport, fields);
      }

      toast({
        title: "Export Successful",
        description: `Exported ${productsToExport.length} products as ${exportFormat.toUpperCase()}.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Group fields by category
  const fieldsByCategory = exportFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">
                  {productsToExport.length} products
                </Badge>
                <Badge variant="outline">
                  {selectedFields.size} fields
                </Badge>
                <Badge variant="outline">
                  {exportFormat.toUpperCase()} format
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Export Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV (Comma Separated Values)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        JSON (JavaScript Object Notation)
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Export Scope</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={exportScope} 
                    onValueChange={(value: 'all' | 'selected' | 'filtered') => setExportScope(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All products ({products.length})</Label>
                    </div>
                    {selectedProducts && selectedProducts.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="selected" id="selected" />
                        <Label htmlFor="selected">Selected products ({selectedProducts.size})</Label>
                      </div>
                    )}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Field Selection */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Fields to Export
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={selectEssentialFields}>
                      Essential
                    </Button>
                    <Button size="sm" variant="outline" onClick={selectAllFields}>
                      All
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {Object.entries(fieldsByCategory).map(([category, fields]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                        {category}
                      </h4>
                      <div className="space-y-2 ml-2">
                        {fields.map(field => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={field.key}
                              checked={selectedFields.has(field.key)}
                              onCheckedChange={() => toggleField(field.key)}
                            />
                            <Label htmlFor={field.key} className="text-sm">
                              {field.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.size === 0}>
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {productsToExport.length} Products
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};