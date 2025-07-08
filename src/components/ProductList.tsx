import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Package, ExternalLink, Zap, CheckSquare, Square } from 'lucide-react';
import { Product } from '@/pages/Index';

interface ProductListProps {
  products: Product[];
  selectedProducts: Set<string>;
  onSelectionChange: (selection: Set<string>) => void;
  onAddToQueue: (productIds: string[]) => void;
}

export const ProductList = ({ 
  products, 
  selectedProducts, 
  onSelectionChange, 
  onAddToQueue 
}: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return `https://your-store.myshopify.com/products/${handle}`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-4">
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

        {/* Select All */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({selectedProducts.size} selected)
          </span>
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
                      onClick={() => window.open(getProductUrl(product.handle), '_blank')}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAddToQueue([product.id])}
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
    </div>
  );
};