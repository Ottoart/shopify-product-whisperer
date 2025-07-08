import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Loader, CheckCircle, XCircle, Store, Zap, Tags } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShopifySyncProps {
  onProductsUpdated: () => void;
}

export const ShopifySync = ({ onProductsUpdated }: ShopifySyncProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, brand: '', percentage: 0 });
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const { toast } = useToast();

  const handleImportFromShopify = async (brand: string = 'all') => {
    setIsImporting(true);
    setImportProgress({ current: 0, total: 0, brand: brand === 'all' ? 'Fetching all brands' : brand, percentage: 0 });
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { 
          action: 'fetch',
          brand: brand === 'all' ? undefined : brand,
          onProgress: (progress: any) => {
            setImportProgress({
              current: progress.current,
              total: progress.total,
              brand: progress.brand || brand,
              percentage: progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
            });
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Update brands list
      if (data.brands) {
        setBrands(data.brands);
      }

      setLastSync(new Date());
      onProductsUpdated();
      
      toast({
        title: "Import Successful",
        description: data.message,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products from Shopify",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0, brand: '', percentage: 0 });
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
        {isImporting && importProgress.total > 0 && (
          <div className="space-y-3 p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Importing {importProgress.brand}</span>
              <span className="text-muted-foreground">
                {importProgress.current}/{importProgress.total} ({importProgress.percentage}%)
              </span>
            </div>
            <Progress value={importProgress.percentage} className="h-2" />
          </div>
        )}

        {/* Import Options */}
        <Tabs value={selectedBrand} onValueChange={setSelectedBrand} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="all" className="gap-2">
              <Store className="h-4 w-4" />
              All Brands
            </TabsTrigger>
            {brands.slice(0, 3).map((brand) => (
              <TabsTrigger key={brand} value={brand} className="gap-2">
                <Tags className="h-4 w-4" />
                {brand}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => handleImportFromShopify('all')}
                disabled={isImporting}
                className="bg-gradient-primary transition-all duration-300 hover:scale-105"
              >
                {isImporting ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isImporting ? 'Importing...' : 'Import All Products'}
              </Button>

              <Button
                onClick={() => {
                  toast({
                    title: "Feature Available",
                    description: "Export products after selecting them in the product list",
                  });
                }}
                disabled={isExporting}
                variant="outline"
                className="transition-all duration-300 hover:scale-105"
              >
                {isExporting ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export to Shopify'}
              </Button>
            </div>
          </TabsContent>

          {brands.map((brand) => (
            <TabsContent key={brand} value={brand} className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Import products for {brand} brand only. This helps prevent timeouts with large catalogs.
                </p>
                <Button
                  onClick={() => handleImportFromShopify(brand)}
                  disabled={isImporting}
                  className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
                >
                  {isImporting ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isImporting ? 'Importing...' : `Import ${brand} Products`}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Info */}
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Import will fetch all products from your Shopify store and replace your current product list. 
            Export will update the selected products in your Shopify store with AI-optimized content.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};