import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductEditor } from '@/components/ProductEditor';
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
          <Card key={product.id} className="p-4 hover:shadow-card transition-all duration-300">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedProducts.has(product.id)}
                onCheckedChange={() => handleSelectProduct(product.id)}
                className="mt-1"
              />
              
              {product.imageSrc && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img 
                    src={product.imageSrc} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{product.vendor}</span>
                      <span>•</span>
                      <span>${product.variantPrice}</span>
                      {product.type && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs py-0 px-1">
                            {product.type}
                          </Badge>
                        </>
                      )}
                    </div>
                    {product.tags && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.split(',').slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                            {tag.trim()}
                          </Badge>
                        ))}
                        {product.tags.split(',').length > 3 && (
                          <Badge variant="outline" className="text-xs py-0 px-1">
                            +{product.tags.split(',').length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    {getProductUrl(product.handle) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getProductUrl(product.handle)!, '_blank')}
                        className="transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setProcessingProduct(product)}
                      className="bg-gradient-primary transition-all duration-300 hover:scale-105"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
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