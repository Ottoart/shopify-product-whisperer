import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { ProductWhisperFilters as Filters } from '@/types/productwhisper';

interface ProductWhisperFiltersProps {
  filters: Filters;
  filterOptions: {
    types: string[];
    categories: string[];
    vendors: string[];
  };
  onFiltersChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

export const ProductWhisperFilters = ({
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters
}: ProductWhisperFiltersProps) => {
  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.vendor !== 'all' || 
    filters.published !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined;

  return (
    <Card className="animate-accordion-down">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Type */}
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => onFiltersChange({ type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => onFiltersChange({ category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor */}
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select
              value={filters.vendor}
              onValueChange={(value) => onFiltersChange({ vendor: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {filterOptions.vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Published Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.published}
              onValueChange={(value) => onFiltersChange({ published: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="published">Published Only</SelectItem>
                <SelectItem value="draft">Drafts Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Min Price ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filters.priceMin || ''}
              onChange={(e) => onFiltersChange({ 
                priceMin: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Price ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="1000.00"
              value={filters.priceMax || ''}
              onChange={(e) => onFiltersChange({ 
                priceMax: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};