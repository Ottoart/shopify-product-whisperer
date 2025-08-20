import { useState } from 'react';
import { ProductWhisperCard } from './ProductWhisperCard';
import { ProductWhisperFilters } from './ProductWhisperFilters';
import { ProductWhisperBulkEdit } from './ProductWhisperBulkEdit';
import { ActiveFilters } from './ActiveFilters';
import { FilterPresets } from './FilterPresets';
import { ProductWhisperItem, ProductWhisperFilters as Filters } from '@/types/productwhisper';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductWhisperListProps {
  products: ProductWhisperItem[];
  filters: Filters;
  filterOptions: {
    types: string[];
    categories: string[];
    vendors: string[];
  };
  showFilters: boolean;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  onProductsUpdated: () => void;
  onAIOptimized?: (productId: string, optimizedData: any) => void;
}

const PRODUCTS_PER_PAGE = 50;

export const ProductWhisperList = ({
  products,
  filters,
  filterOptions,
  showFilters,
  onFiltersChange,
  onClearFilters,
  onProductsUpdated,
  onAIOptimized
}: ProductWhisperListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Pagination
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleSelectProduct = (productId: string, selected: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (selected) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(currentProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: Partial<Filters>) => {
    setCurrentPage(1);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    onClearFilters();
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.vendor !== 'all' || filters.published !== 'all'
              ? "Try adjusting your filters to see more products."
              : "You don't have any products yet. Connect a store or import products to get started."
            }
          </p>
          {(filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.vendor !== 'all' || filters.published !== 'all') && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <ProductWhisperFilters
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Bulk Selection Header */}
      {currentProducts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.size === currentProducts.length && currentProducts.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm font-medium">
                Select all on page ({selectedProducts.size} selected)
              </span>
            </label>
          </div>
          
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Bulk Edit ({selectedProducts.size})
              </Button>
              <Button size="sm" className="bg-gradient-primary">
                AI Optimize ({selectedProducts.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProducts.map((product) => (
          <ProductWhisperCard
            key={product.id}
            product={product}
            isSelected={selectedProducts.has(product.id)}
            onSelect={(selected) => handleSelectProduct(product.id, selected)}
            onProductUpdated={onProductsUpdated}
            onAIOptimized={onAIOptimized}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};