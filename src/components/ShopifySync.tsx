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
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface ShopifySyncProps {
  onProductsUpdated: () => void;
}

export const ShopifySync = ({ onProductsUpdated }: ShopifySyncProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, item: '', percentage: 0 });
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [importedItems, setImportedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<'brands' | 'product_types' | 'collections'>('brands');
  const { toast } = useToast();
  const { storeId } = useShopifyCredentials();

  const fetchAvailableItems = async (filterType: 'brands' | 'product_types' | 'collections') => {
    setIsFetchingItems(true);
    setActiveFilterType(filterType);
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { action: 'fetch-filters', filterType, storeId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAvailableItems(data.items || []);
      
      // Check which items are already imported based on filter type
      let field = 'vendor';
      if (filterType === 'product_types') field = 'type';
      
      const { data: existingProducts, error: dbError } = await supabase
        .from('products')
        .select(field)
        .not(field, 'is', null)
        .not(field, 'eq', '');
      
      if (!dbError && existingProducts) {
        const imported = [...new Set(existingProducts.map(p => p[field]))];
        setImportedItems(imported);
      }
      
      setShowItemSelection(true);

    } catch (error: any) {
      console.error(`Error fetching ${filterType}:`, error);
      toast({
        title: `Failed to fetch ${filterType}`,
        description: error.message || `Could not retrieve ${filterType} from Shopify`,
        variant: "destructive",
      });
    } finally {
      setIsFetchingItems(false);
    }
  };

  const handleImportFromShopify = async (items: string[] = []) => {
    setIsImporting(true);
    setShowItemSelection(false);
    const itemList = items.length > 0 ? items : selectedItems;
    
    try {
      for (const item of itemList) {
        setImportProgress({ current: 0, total: itemList.length, item, percentage: 0 });
        
        const body: any = { action: 'fetch', storeId };
        
        if (activeFilterType === 'brands') {
          body.brand = item;
        } else {
          body.filterType = activeFilterType;
          body.filterValue = item;
        }
        
        const { data, error } = await supabase.functions.invoke('shopify-products', {
          body
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.error) {
          console.error('Shopify API error:', data.error);
          throw new Error(data.error);
        }
      }

      setLastSync(new Date());
      onProductsUpdated();
      
      toast({
        title: "Import Successful",
        description: `Successfully imported products for ${itemList.length} ${activeFilterType}`,
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
      setImportProgress({ current: 0, total: 0, item: '', percentage: 0 });
      setSelectedItems([]);
    }
  };

  const handleExportToShopify = async (products: any[]) => {
    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { 
          action: 'update',
          storeId,
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

  const toggleItemSelection = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(availableItems);
  };

  const clearSelection = () => {
    setSelectedItems([]);
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

        {/* Item Selection Modal */}
        {showItemSelection && (
          <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select {activeFilterType} to Import</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllItems}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {availableItems.map((item) => {
                const isImported = importedItems.includes(item);
                const isSelected = selectedItems.includes(item);
                
                return (
                  <Badge
                    key={item}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer transition-all duration-200 hover:scale-105
                      ${isImported ? 'ring-2 ring-accent ring-offset-1' : ''}
                      ${isSelected ? 'bg-gradient-primary' : ''}
                    `}
                    onClick={() => toggleItemSelection(item)}
                  >
                    {item}
                    {isImported && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {selectedItems.length} {activeFilterType} selected • 
                <span className="text-accent"> Highlighted items already imported</span>
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowItemSelection(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary"
                  onClick={() => handleImportFromShopify()}
                  disabled={selectedItems.length === 0}
                >
                  Import Selected ({selectedItems.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {isImporting && importProgress.total > 0 && (
          <div className="space-y-3 p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Importing {importProgress.item}</span>
              <span className="text-muted-foreground">
                {importProgress.current}/{importProgress.total} {activeFilterType}
              </span>
            </div>
            <Progress value={(importProgress.current / importProgress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Filter Type Tabs */}
        <Tabs value={activeFilterType} onValueChange={(value) => setActiveFilterType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted border border-border shadow-sm">
            <TabsTrigger value="brands" className="bg-background text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium border-r border-border">Brands</TabsTrigger>
            <TabsTrigger value="product_types" className="bg-background text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium border-r border-border">Product Types</TabsTrigger>
            <TabsTrigger value="collections" className="bg-background text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Collections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brands" className="space-y-4">
            <Button
              onClick={() => fetchAvailableItems('brands')}
              disabled={isImporting || isFetchingItems}
              className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
            >
              {isFetchingItems ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : isImporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isFetchingItems ? 'Loading Brands...' : isImporting ? 'Importing...' : 'Import by Brands'}
            </Button>
          </TabsContent>
          
          <TabsContent value="product_types" className="space-y-4">
            <Button
              onClick={() => fetchAvailableItems('product_types')}
              disabled={isImporting || isFetchingItems}
              className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
            >
              {isFetchingItems ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : isImporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Tags className="h-4 w-4 mr-2" />
              )}
              {isFetchingItems ? 'Loading Types...' : isImporting ? 'Importing...' : 'Import by Product Types'}
            </Button>
          </TabsContent>
          
          <TabsContent value="collections" className="space-y-4">
            <Button
              onClick={() => fetchAvailableItems('collections')}
              disabled={isImporting || isFetchingItems}
              className="w-full bg-gradient-primary transition-all duration-300 hover:scale-105"
            >
              {isFetchingItems ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : isImporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isFetchingItems ? 'Loading Collections...' : isImporting ? 'Importing...' : 'Import by Collections'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Export Action */}
        <div className="pt-4">
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
        </div>

        {/* Info */}
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Import products by brands, product types, or collections from your Shopify store. 
            Export will update selected products in your Shopify store with AI-optimized content.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};