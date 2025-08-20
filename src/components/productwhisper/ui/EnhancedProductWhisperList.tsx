import React, { useState, useCallback, useMemo } from 'react';
import { ProductWhisperList } from '../ProductWhisperList';
import { VirtualProductWhisperList } from '../performance/VirtualProductWhisperList';
import { OptimisticProductCard } from '../performance/OptimisticProductCard';
import { SkeletonProductGrid } from '../performance/SkeletonProductCard';
import { ProductExportDialog } from '../import-export/ProductExportDialog';
import { ProductImportWizard } from '../import-export/ProductImportWizard';
import { KeyboardShortcutHelp } from './KeyboardShortcutHelp';
import { useProductWhisperShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ProductWhisperItem, ProductWhisperFilters } from '@/types/productwhisper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Upload, 
  Grid3X3, 
  List, 
  Zap,
  Settings,
  Keyboard,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProductWhisperListProps {
  products: ProductWhisperItem[];
  filters: ProductWhisperFilters;
  filterOptions: {
    types: string[];
    categories: string[];
    vendors: string[];
  };
  showFilters: boolean;
  onFiltersChange: (filters: Partial<ProductWhisperFilters>) => void;
  onClearFilters: () => void;
  onProductsUpdated: () => void;
  onAIOptimized?: (productId: string, optimizedData: any) => void;
  isLoading?: boolean;
}

type ViewMode = 'grid' | 'virtual' | 'list';

export const EnhancedProductWhisperList: React.FC<EnhancedProductWhisperListProps> = ({
  products,
  filters,
  filterOptions,
  showFilters,
  onFiltersChange,
  onClearFilters,
  onProductsUpdated,
  onAIOptimized,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pageSize, setPageSize] = useState(50);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isVirtualScrollEnabled, setIsVirtualScrollEnabled] = useState(false);
  const [optimisticMode, setOptimisticMode] = useState(true);

  // Keyboard shortcuts
  const { shortcuts } = useProductWhisperShortcuts({
    onExport: () => setIsExportOpen(true),
    onImport: () => setIsImportOpen(true),
    onHelp: () => setIsHelpOpen(true),
    onBulkSelect: () => {
      if (selectedProducts.size > 0) {
        setSelectedProducts(new Set());
      } else {
        setSelectedProducts(new Set(products.slice(0, pageSize).map(p => p.id)));
      }
    },
    onAIOptimize: () => {
      if (selectedProducts.size > 0) {
        handleBulkAIOptimize();
      }
    }
  });

  const handleBulkAIOptimize = useCallback(() => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to optimize.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "AI Optimization Started",
      description: `Optimizing ${selectedProducts.size} products...`,
    });

    // Here you would implement bulk AI optimization
    console.log('Bulk AI optimize:', Array.from(selectedProducts));
  }, [selectedProducts, toast]);

  const handleImportComplete = useCallback((importedProducts: Partial<ProductWhisperItem>[]) => {
    console.log('Import completed:', importedProducts);
    onProductsUpdated();
    setIsImportOpen(false);
  }, [onProductsUpdated]);

  const handleSelectionChange = useCallback((productId: string, selected: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  }, []);

  // Performance settings
  const shouldUseVirtual = useMemo(() => {
    return isVirtualScrollEnabled && products.length > 100;
  }, [isVirtualScrollEnabled, products.length]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonProductGrid count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Product Management</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {products.length} products
              </Badge>
              {selectedProducts.size > 0 && (
                <Badge variant="default">
                  {selectedProducts.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* View Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">View Mode</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'virtual' ? 'default' : 'outline'}
                  onClick={() => setViewMode('virtual')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Page Size</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Performance</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="virtual-scroll" className="text-sm">Virtual Scrolling</Label>
                  <Switch
                    id="virtual-scroll"
                    checked={isVirtualScrollEnabled}
                    onCheckedChange={setIsVirtualScrollEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="optimistic-mode" className="text-sm">Optimistic Updates</Label>
                  <Switch
                    id="optimistic-mode"
                    checked={optimisticMode}
                    onCheckedChange={setOptimisticMode}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Actions</Label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsExportOpen(true)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsHelpOpen(true)}>
                  <Keyboard className="h-4 w-4 mr-1" />
                  Shortcuts
                </Button>
                {selectedProducts.size > 0 && (
                  <Button size="sm" onClick={handleBulkAIOptimize}>
                    <Zap className="h-4 w-4 mr-1" />
                    AI Optimize ({selectedProducts.size})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      {shouldUseVirtual ? (
        <Card>
          <CardContent className="p-0">
            <VirtualProductWhisperList
              products={products}
              height={600}
              width={800}
              itemHeight={400}
              selectedProducts={selectedProducts}
              onSelectionChange={handleSelectionChange}
              onProductUpdated={onProductsUpdated}
              onAIOptimized={onAIOptimized}
            />
          </CardContent>
        </Card>
      ) : (
        <ProductWhisperList
          products={products}
          filters={filters}
          filterOptions={filterOptions}
          showFilters={showFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
          onProductsUpdated={onProductsUpdated}
          onAIOptimized={onAIOptimized}
        />
      )}

      {/* Export Dialog */}
      <ProductExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        products={products}
        selectedProducts={selectedProducts}
      />

      {/* Import Wizard */}
      <ProductImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutHelp
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
};