import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductEditor } from '@/components/ProductEditor';
import { ProductListItem } from '@/components/ProductListItem';
import { SingleProductProcessor } from '@/components/SingleProductProcessor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, ExternalLink, Zap, CheckSquare, Square, Edit3, Filter } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [processingProduct, setProcessingProduct] = useState<Product | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [typeFilter, setTypeFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || product.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesVendor = !vendorFilter || product.vendor.toLowerCase().includes(vendorFilter.toLowerCase());
    const matchesTag = !tagFilter || product.tags.toLowerCase().includes(tagFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesVendor && matchesTag;
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Input
            placeholder="Filter by type..."
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          />
          
          <Input
            placeholder="Filter by vendor..."
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-40"
          />
          
          <Input
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-40"
          />

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
          
          {(typeFilter || vendorFilter || tagFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTypeFilter('');
                setVendorFilter('');
                setTagFilter('');
              }}
            >
              Clear Filters
            </Button>
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