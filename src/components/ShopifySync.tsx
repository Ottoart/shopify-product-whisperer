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
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, brand: '', percentage: 0 });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [importedBrands, setImportedBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showBrandSelection, setShowBrandSelection] = useState(false);
  const { toast } = useToast();

  const fetchAvailableBrands = async () => {
    setIsFetchingBrands(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch-brands' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAvailableBrands(data.brands || []);
      
      // Check which brands are already imported
      const { data: existingProducts, error: dbError } = await supabase
        .from('products')
        .select('vendor')
        .not('vendor', 'is', null)
        .not('vendor', 'eq', '');
      
      if (!dbError && existingProducts) {
        const imported = [...new Set(existingProducts.map(p => p.vendor))];
        setImportedBrands(imported);
      }
      
      setShowBrandSelection(true);

    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Failed to fetch brands",
        description: error.message || "Could not retrieve brand information from Shopify",
        variant: "destructive",
      });
    } finally {
      setIsFetchingBrands(false);
    }
  };

  const handleImportFromShopify = async (brands: string[] = []) => {
    setIsImporting(true);
    setShowBrandSelection(false);
    const brandList = brands.length > 0 ? brands : selectedBrands;
    
    try {
      for (const brand of brandList) {
        setImportProgress({ current: 0, total: brandList.length, brand, percentage: 0 });
        
        const { data, error } = await supabase.functions.invoke('shopify-products', {
          body: { 
            action: 'fetch',
            brand: brand
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }
      }

      setLastSync(new Date());
      onProductsUpdated();
      
      toast({
        title: "Import Successful",
        description: `Successfully imported products for ${brandList.length} brand(s)`,
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
      setSelectedBrands([]);
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

  const toggleBrandSelection = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const selectAllBrands = () => {
    setSelectedBrands(availableBrands);
  };

  const clearSelection = () => {
    setSelectedBrands([]);
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

        {/* Brand Selection Modal */}
        {showBrandSelection && (
          <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select Brands to Import</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllBrands}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {availableBrands.map((brand) => {
                const isImported = importedBrands.includes(brand);
                const isSelected = selectedBrands.includes(brand);
                
                return (
                  <Badge
                    key={brand}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer transition-all duration-200 hover:scale-105
                      ${isImported ? 'ring-2 ring-accent ring-offset-1' : ''}
                      ${isSelected ? 'bg-gradient-primary' : ''}
                    `}
                    onClick={() => toggleBrandSelection(brand)}
                  >
                    {brand}
                    {isImported && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {selectedBrands.length} brand(s) selected • 
                <span className="text-accent"> Highlighted brands already imported</span>
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBrandSelection(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary"
                  onClick={() => handleImportFromShopify()}
                  disabled={selectedBrands.length === 0}
                >
                  Import Selected ({selectedBrands.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {isImporting && importProgress.total > 0 && (
          <div className="space-y-3 p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Importing {importProgress.brand}</span>
              <span className="text-muted-foreground">
                {importProgress.current}/{importProgress.total} brands
              </span>
            </div>
            <Progress value={(importProgress.current / importProgress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={fetchAvailableBrands}
            disabled={isImporting || isFetchingBrands}
            className="bg-gradient-primary transition-all duration-300 hover:scale-105"
          >
            {isFetchingBrands ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : isImporting ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isFetchingBrands ? 'Loading Brands...' : isImporting ? 'Importing...' : 'Import Products'}
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

        {/* Info */}
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Import will fetch products from your Shopify store. You can import all products or filter by brand to prevent timeouts. 
            Export will update selected products in your Shopify store with AI-optimized content.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};