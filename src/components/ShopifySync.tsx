import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Loader, CheckCircle, XCircle, Store, Zap, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShopifySyncProps {
  onProductsUpdated: () => void;
}

export const ShopifySync = ({ onProductsUpdated }: ShopifySyncProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentVendor, setCurrentVendor] = useState('');
  const [vendors, setVendors] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch-vendors' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setVendors(data.vendors);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Failed to fetch vendors",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleImportFromShopify = async () => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      if (vendors.length === 0) {
        // Import all products at once if no vendors
        const { data, error } = await supabase.functions.invoke('shopify-products', {
          body: { action: 'fetch' }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setImportProgress(100);
        setLastSync(new Date());
        onProductsUpdated();
        
        toast({
          title: "Import Successful",
          description: data.message,
        });
      } else {
        // Import vendor by vendor
        for (let i = 0; i < vendors.length; i++) {
          const vendor = vendors[i];
          setCurrentVendor(vendor);
          setImportProgress(((i + 1) / vendors.length) * 100);

          const { data, error } = await supabase.functions.invoke('shopify-products', {
            body: { action: 'fetch', vendor }
          });

          if (error) {
            console.error(`Error importing ${vendor}:`, error);
            continue;
          }

          if (data.error) {
            console.error(`Error importing ${vendor}:`, data.error);
            continue;
          }

          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        setCurrentVendor('');
        setLastSync(new Date());
        onProductsUpdated();
        
        toast({
          title: "Import Successful",
          description: `Imported products from ${vendors.length} brands`,
        });
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products from Shopify",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setCurrentVendor('');
    }
  };

  const handleImportVendor = async (vendor: string) => {
    setIsImporting(true);
    setCurrentVendor(vendor);
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch', vendor }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onProductsUpdated();
      
      toast({
        title: "Import Successful",
        description: `Imported products from ${vendor}`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || `Failed to import products from ${vendor}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setCurrentVendor('');
    }
  };

  const handleExportToShopify = async (products: any[]) => {
    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { 
          action: 'update',
          products: products.map(p => ({
            handle: p.handle,
            title: p.title,
            description: p.bodyHtml,
            type: p.type,
            tags: p.tags
          }))
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Export Successful",
        description: data.message,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export products to Shopify",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle>Shopify Integration</CardTitle>
            <CardDescription>
              Sync products directly with your Shopify store
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
            {lastSync && (
              <span className="text-xs text-muted-foreground">
                Last sync: {lastSync.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Import Progress */}
        {isImporting && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span>Importing products...</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} className="h-2" />
            {currentVendor && (
              <p className="text-xs text-muted-foreground animate-pulse">
                Current brand: {currentVendor}
              </p>
            )}
          </div>
        )}

        {/* Import Options */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Import All</TabsTrigger>
            <TabsTrigger value="brands">By Brand</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            <Button
              onClick={handleImportFromShopify}
              disabled={isImporting}
              className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
            >
              {isImporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isImporting ? 'Importing All Brands...' : 'Import All Products'}
            </Button>
          </TabsContent>
          
          <TabsContent value="brands" className="space-y-3">
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {vendors.map((vendor) => (
                <Button
                  key={vendor}
                  onClick={() => handleImportVendor(vendor)}
                  disabled={isImporting}
                  variant="outline"
                  className="justify-start transition-all duration-300 hover:scale-105"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isImporting && currentVendor === vendor ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Importing {vendor}...
                    </>
                  ) : (
                    `Import ${vendor}`
                  )}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Export */}
        <Button
          onClick={() => {
            toast({
              title: "Feature Available",
              description: "Export products after selecting them in the product list",
            });
          }}
          disabled={isExporting}
          variant="outline"
          className="w-full transition-all duration-300 hover:scale-105"
        >
          {isExporting ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export to Shopify'}
        </Button>

        {/* Info */}
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Import by brand helps prevent timeouts for large stores. You can import all at once or brand by brand.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};