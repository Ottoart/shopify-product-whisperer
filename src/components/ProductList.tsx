import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductEditor } from '@/components/ProductEditor';
import { ProductListItem } from '@/components/ProductListItem';
import { SingleProductProcessor } from '@/components/SingleProductProcessor';
import { BulkEditDialog } from '@/components/BulkEditDialog';
import { ChangeHistoryDialog } from '@/components/ChangeHistoryDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Package, ExternalLink, Zap, CheckSquare, Square, Edit3, Filter, ChevronDown, ChevronRight, History, Store } from 'lucide-react';
import { Product, UpdatedProduct } from '@/pages/Index';

interface ProductListProps {
  products: Product[];
  selectedProducts: Set<string>;
  onSelectionChange: (selection: Set<string>) => void;
  onAddToQueue: (productIds: string[]) => void;
  onProductsUpdated: () => void;
  onProductUpdated: (productId: string, updatedData: UpdatedProduct) => void;
  storeUrl?: string;
}

export const ProductList = ({ 
  products, 
  selectedProducts, 
  onSelectionChange, 
  onAddToQueue,
  onProductsUpdated,
  onProductUpdated,
  storeUrl 
}: ProductListProps) => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [processingProduct, setProcessingProduct] = useState<Product | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(500);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedListingStatus, setSelectedListingStatus] = useState<Set<string>>(new Set());

  // Handle URL parameters for store filtering
  const [storeFilter, setStoreFilter] = useState<string>('');
  
  useEffect(() => {
    const storeParam = searchParams.get('store');
    if (storeParam) {
      const decodedStore = decodeURIComponent(storeParam);
      setStoreFilter(decodedStore);
    } else {
      setStoreFilter('');
    }
  }, [searchParams]);
  
  // Collapsible states
  const [typesOpen, setTypesOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  // Filter products first by store to ensure accurate filter counts
  const storeFilteredProducts = products.filter(product => {
    // Improved store filtering to handle eBay Store -> eBay mapping
    if (!storeFilter) return true;
    
    const normalizedStoreFilter = storeFilter.toLowerCase();
    const productVendor = product.vendor?.toLowerCase() || '';
    
    // Direct match
    if (productVendor.includes(normalizedStoreFilter)) return true;
    
    // Handle "eBay Store" -> "eBay" mapping
    if (normalizedStoreFilter.includes('ebay') && productVendor === 'ebay') return true;
    if (normalizedStoreFilter.includes('shopify') && productVendor.includes('shopify')) return true;
    
    // Bidirectional check - store name contains vendor or vendor contains store name
    if (normalizedStoreFilter.includes(productVendor) || productVendor.includes(normalizedStoreFilter.replace(' store', ''))) return true;
    
    return false;
  });

  // Extract unique values for filters FROM STORE-FILTERED PRODUCTS ONLY
  const uniqueTypes = [...new Set(storeFilteredProducts.map(p => p.type).filter(Boolean))];
  const uniqueVendors = [...new Set(storeFilteredProducts.map(p => p.vendor).filter(Boolean))];
  const uniqueCategories = [...new Set(storeFilteredProducts.map(p => p.category).filter(Boolean))];
  const uniqueTags = [...new Set(storeFilteredProducts.flatMap(p => p.tags?.split(',').map(tag => tag.trim())).filter(Boolean))];
  const uniqueListingStatuses = [...new Set(storeFilteredProducts.map(p => p.listingStatus).filter(Boolean))];

  const toggleFilter = (selectedSet: Set<string>, setter: (set: Set<string>) => void, value: string) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
  };

  // Filter products based on search and selected filters
  const filteredProducts = storeFilteredProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(product.type);
    const matchesVendor = selectedVendors.size === 0 || selectedVendors.has(product.vendor);
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(product.category || '');
    const matchesTag = selectedTags.size === 0 || product.tags?.split(',').some(tag => selectedTags.has(tag.trim()));
    const matchesListingStatus = selectedListingStatus.size === 0 || selectedListingStatus.has(product.listingStatus || '');
    
    return matchesSearch && matchesType && matchesVendor && matchesCategory && matchesTag && matchesListingStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      onSelectionChange(new Set());
    } else {
      const newSelection = new Set(paginatedProducts.map(p => p.id));
      onSelectionChange(newSelection);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    onSelectionChange(newSelection);
  };

  const handleAddSelectedToQueue = () => {
    const selectedIds = Array.from(selectedProducts);
    if (selectedIds.length > 0) {
      onAddToQueue(selectedIds);
      onSelectionChange(new Set());
    }
  };

  const getProductUrl = (handle: string) => {
    if (storeUrl && storeUrl.trim()) {
      const cleanUrl = storeUrl.replace(/\/+$/, ''); // Remove trailing slashes
      return `${cleanUrl}/products/${handle}`;
    }
    return null; // Don't create invalid links
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="p-6 border-b space-y-4">
        {/* Store Context Header */}
        {storeFilter && (
          <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-medium">Viewing products from: {storeFilter}</span>
            <Badge variant="secondary">{storeFilteredProducts.length} products</Badge>
          </div>
        )}
        
        {/* Search and Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, SKU, vendor, type, category, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="500">500 per page</SelectItem>
              <SelectItem value="1000">1000 per page</SelectItem>
              <SelectItem value="99999">Show All</SelectItem>
            </SelectContent>
          </Select>
          {selectedProducts.size > 0 && (
            <>
              <BulkEditDialog
                selectedProducts={Array.from(selectedProducts)}
                products={filteredProducts}
                onComplete={() => {
                  onProductsUpdated();
                  onSelectionChange(new Set());
                }}
              >
                <Button variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bulk Edit ({selectedProducts.size})
                </Button>
              </BulkEditDialog>
              <Button onClick={handleAddSelectedToQueue} className="bg-gradient-primary">
                <Zap className="h-4 w-4 mr-2" />
                AI Optimize ({selectedProducts.size})
              </Button>
            </>
          )}
          <ChangeHistoryDialog>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </ChangeHistoryDialog>
        </div>

        {/* Smart Filters Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Smart Filters:</span>
            
            {/* Quick Filter Presets */}
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                setSelectedTags(new Set(['sale', 'clearance', 'discount']));
              }}
            >
              Sale Items
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                // Show only products with low inventory (less than 10)
                const currentProducts = products.filter(p => (p.variantInventoryQty || 0) < 10);
                // Filter by setting search term that matches these products
                if (currentProducts.length > 0) {
                  setSearchTerm(''); // Clear search first
                  // Find common tags or characteristics to filter by
                  const lowStockTags = ['low-stock', 'reorder', 'out-of-stock'];
                  setSelectedTags(new Set(lowStockTags.filter(tag => 
                    currentProducts.some(p => p.tags?.includes(tag))
                  )));
                }
              }}
            >
              Low Stock
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                // Clear other filters and show only high-value products
                setSearchTerm('');
                setSelectedTypes(new Set());
                setSelectedVendors(new Set());
                setSelectedCategories(new Set());
                setSelectedTags(new Set());
                // Set a minimum price filter - this would need additional state management
                // For now, we'll use a workaround by filtering expensive types/categories
                const expensiveTypes = products
                  .filter(p => (p.variantPrice || 0) > 100)
                  .map(p => p.type)
                  .filter(Boolean);
                setSelectedTypes(new Set(expensiveTypes.slice(0, 5))); // Limit to top 5
              }}
            >
              High Value
            </Badge>
            
            {(selectedTypes.size > 0 || selectedVendors.size > 0 || selectedCategories.size > 0 || selectedTags.size > 0 || selectedListingStatus.size > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTypes(new Set());
                  setSelectedVendors(new Set());
                  setSelectedCategories(new Set());
                  setSelectedTags(new Set());
                  setSelectedListingStatus(new Set());
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
          
          {/* Types Filter */}
          <Collapsible open={typesOpen} onOpenChange={setTypesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              {typesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Product Types ({uniqueTypes.length}) {selectedTypes.size > 0 && `- ${selectedTypes.size} selected`}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {uniqueTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.has(type) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 text-xs"
                    onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Vendors Filter */}
          <Collapsible open={vendorsOpen} onOpenChange={setVendorsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              {vendorsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Vendors ({uniqueVendors.length}) {selectedVendors.size > 0 && `- ${selectedVendors.size} selected`}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {uniqueVendors.map((vendor) => (
                  <Badge
                    key={vendor}
                    variant={selectedVendors.has(vendor) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 text-xs"
                    onClick={() => toggleFilter(selectedVendors, setSelectedVendors, vendor)}
                  >
                    {vendor}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Categories Filter */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              {categoriesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Categories ({uniqueCategories.length}) {selectedCategories.size > 0 && `- ${selectedCategories.size} selected`}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {uniqueCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.has(category) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 text-xs"
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tags Filter */}
          <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              {tagsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Tags ({uniqueTags.length}) {selectedTags.size > 0 && `- ${selectedTags.size} selected`}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {uniqueTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.has(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 text-xs"
                    onClick={() => toggleFilter(selectedTags, setSelectedTags, tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Listing Status Filter for eBay */}
          {storeFilter && storeFilter.toLowerCase().includes('ebay') && uniqueListingStatuses.length > 0 && (
            <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                {tagsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Listing Status ({uniqueListingStatuses.length}) {selectedListingStatus.size > 0 && `- ${selectedListingStatus.size} selected`}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="flex flex-wrap gap-1">
                  {uniqueListingStatuses.map((status) => (
                    <Badge
                      key={status}
                      variant={selectedListingStatus.has(status) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 text-xs"
                      onClick={() => toggleFilter(selectedListingStatus, setSelectedListingStatus, status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Results Summary and Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all on page ({selectedProducts.size} selected)
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </span>
            {storeFilteredProducts.length > filteredProducts.length && (
              <span className="text-muted-foreground ml-2">
                ({storeFilteredProducts.length} in {storeFilter || 'all stores'})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2 px-6">
        {paginatedProducts.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            isSelected={selectedProducts.has(product.id)}
            onSelectionChange={handleSelectProduct}
            onOptimize={setProcessingProduct}
            storeUrl={storeUrl}
            onProductUpdated={onProductsUpdated}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProduct && (
        <ProductEditor
          product={editingProduct}
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={onProductsUpdated}
        />
      )}

      {/* Single Product Processor Modal */}
      {processingProduct && (
        <SingleProductProcessor
          product={processingProduct}
          isOpen={Boolean(processingProduct)}
          onClose={() => setProcessingProduct(null)}
          onProductUpdated={onProductUpdated}
        />
      )}
    </div>
  );
};