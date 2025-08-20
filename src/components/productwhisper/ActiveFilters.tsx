import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ProductWhisperFilters } from '@/types/productwhisper';

interface ActiveFiltersProps {
  filters: ProductWhisperFilters;
  onFilterChange: (newFilters: Partial<ProductWhisperFilters>) => void;
  onClearAll: () => void;
}

export const ActiveFilters = ({ filters, onFilterChange, onClearAll }: ActiveFiltersProps) => {
  const activeFilters = [];

  // Search filter
  if (filters.search) {
    activeFilters.push({
      key: 'search',
      label: `Search: ${filters.search}`,
      remove: () => onFilterChange({ search: '' })
    });
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    activeFilters.push({
      key: 'type',
      label: `Type: ${filters.type}`,
      remove: () => onFilterChange({ type: 'all' })
    });
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    activeFilters.push({
      key: 'category',
      label: `Category: ${filters.category}`,
      remove: () => onFilterChange({ category: 'all' })
    });
  }

  // Vendor filter
  if (filters.vendor && filters.vendor !== 'all') {
    activeFilters.push({
      key: 'vendor',
      label: `Vendor: ${filters.vendor}`,
      remove: () => onFilterChange({ vendor: 'all' })
    });
  }

  // Published filter
  if (filters.published !== 'all') {
    activeFilters.push({
      key: 'published',
      label: `Status: ${filters.published}`,
      remove: () => onFilterChange({ published: 'all' })
    });
  }

  // Price filters
  if (filters.priceMin !== undefined && filters.priceMin > 0) {
    activeFilters.push({
      key: 'priceMin',
      label: `Min Price: $${filters.priceMin}`,
      remove: () => onFilterChange({ priceMin: undefined })
    });
  }

  if (filters.priceMax !== undefined && filters.priceMax > 0) {
    activeFilters.push({
      key: 'priceMax',
      label: `Max Price: $${filters.priceMax}`,
      remove: () => onFilterChange({ priceMax: undefined })
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="pr-1">
          {filter.label}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 ml-2 hover:bg-transparent"
            onClick={filter.remove}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};