import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ExportOptions {
  format: 'csv' | 'json';
  filters?: any;
}

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

export const useStoreProductImportExport = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportProducts = async (options: ExportOptions = { format: 'csv' }) => {
    setIsExporting(true);
    try {
      const { data: products, error } = await supabase
        .from('store_products')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (options.format === 'csv') {
        const csvContent = convertToCSV(products || []);
        downloadFile(csvContent, 'store_products.csv', 'text/csv');
      } else {
        const jsonContent = JSON.stringify(products, null, 2);
        downloadFile(jsonContent, 'store_products.json', 'application/json');
      }

      toast({
        title: "Export Successful",
        description: `Exported ${products?.length || 0} products`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importProducts = async (file: File): Promise<ImportResult> => {
    setIsImporting(true);
    try {
      const text = await file.text();
      let data: any[];

      if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      const result: ImportResult = {
        success: 0,
        errors: [],
        total: data.length
      };

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Authentication required');

      for (let i = 0; i < data.length; i++) {
        try {
          const product = validateAndTransformProduct(data[i], i + 1, user.user.id);
          
          const { error } = await supabase
            .from('store_products')
            .upsert(product, { onConflict: 'sku' });

          if (error) throw error;
          result.success++;
        } catch (error: any) {
          result.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      toast({
        title: "Import Completed",
        description: `Successfully imported ${result.success}/${result.total} products`,
        variant: result.errors.length > 0 ? "default" : "default"
      });

      return result;
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: 0, errors: [error.message], total: 0 };
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Sample Product 1",
        description: "A great product for your store",
        price: 29.99,
        compare_at_price: 39.99,
        currency: "USD",
        image_url: "https://example.com/image.jpg",
        category: "Electronics",
        supplier: "Sample Supplier",
        status: "active",
        inventory_quantity: 100,
        cost: 15.00,
        markup_percentage: 100
      }
    ];

    const csvContent = convertToCSV(template);
    downloadFile(csvContent, 'product_import_template.csv', 'text/csv');
  };

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const validateAndTransformProduct = (data: any, rowNumber: number, userId: string) => {
    if (!data.name || !data.supplier) {
      throw new Error('Name and supplier are required fields');
    }

    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0) {
      throw new Error('Invalid price value');
    }

    return {
      user_id: userId,
      name: data.name.toString().trim(),
      description: data.description?.toString() || '',
      price: price,
      sale_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
      currency: data.currency || 'USD',
      image_url: data.image_url || null,
      category: data.category || 'Uncategorized',
      supplier: data.supplier.toString().trim(),
      status: ['active', 'draft', 'discontinued'].includes(data.status) ? data.status : 'draft',
      inventory_quantity: data.inventory_quantity ? parseInt(data.inventory_quantity) : 0,
      cost: data.cost ? parseFloat(data.cost) : null,
      markup_percentage: data.markup_percentage ? parseFloat(data.markup_percentage) : null,
      brand: data.brand || null,
      material: data.material || null,
      color: data.color || null,
      sku: data.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      featured: Boolean(data.featured),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      in_stock: (parseInt(data.inventory_quantity) || 0) > 0,
      updated_at: new Date().toISOString()
    };
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    exportProducts,
    importProducts,
    downloadTemplate,
    isExporting,
    isImporting
  };
};