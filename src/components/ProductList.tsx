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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Package, ExternalLink, Zap, CheckSquare, Square, Edit3, Filter, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Handle URL parameters for store filtering
  useEffect(() => {
    const storeParam = searchParams.get('store');
    if (storeParam) {
      const decodedStore = decodeURIComponent(storeParam);
      // Apply store-specific filtering here if needed
      console.log('Filtering products for store:', decodedStore);
    }
  }, [searchParams]);
  
  // Collapsible states
  const [typesOpen, setTypesOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  // Extract unique values for filters
  const uniqueTypes = [...new Set(products.map(p => p.type).filter(Boolean))];
  const uniqueVendors = [...new Set(products.map(p => p.vendor).filter(Boolean))];
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueTags = [...new Set(products.flatMap(p => p.tags?.split(',').map(tag => tag.trim())).filter(Boolean))];

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
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(product.type);
    const matchesVendor = selectedVendors.size === 0 || selectedVendors.has(product.vendor);
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(product.category || '');
    const matchesTag = selectedTags.size === 0 || product.tags?.split(',').some(tag => selectedTags.has(tag.trim()));
    
    return matchesSearch && matchesType && matchesVendor && matchesCategory && matchesTag;
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
        {/* Search and Bulk Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedProducts.size > 0 && (
            <Button onClick={handleAddSelectedToQueue} className="bg-gradient-primary">
              <Zap className="h-4 w-4 mr-2" />
              Add {selectedProducts.size} to Queue
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
                <SelectItem value="500">500 per page</SelectItem>
                <SelectItem value={products.length.toString()}>Show all ({products.length})</SelectItem>
              </SelectContent>
            </Select>
            {(selectedTypes.size > 0 || selectedVendors.size > 0 || selectedCategories.size > 0 || selectedTags.size > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTypes(new Set());
                  setSelectedVendors(new Set());
                  setSelectedCategories(new Set());
                  setSelectedTags(new Set());
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
            Showing {paginatedProducts.length} of {filteredProducts.length} products
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
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={onProductsUpdated}
        />
      )}

      {/* Single Product Processor Modal */}
      {processingProduct && (
        <SingleProductProcessor
          product={processingProduct}
          isOpen={!!processingProduct}
          onClose={() => setProcessingProduct(null)}
          onProductUpdated={onProductUpdated}
        />
      )}
    </div>
  );
};