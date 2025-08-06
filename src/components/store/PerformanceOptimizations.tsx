import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { Search, X, Loader2 } from 'lucide-react';
import { SearchHighlight, SearchSuggestions, RecentSearches } from './SearchHighlight';

interface DebouncedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

// Simple debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  className,
  debounceMs = 300
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(value, debounceMs);
  const { trackSearch } = useAnalyticsTracking();

  // Execute search when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value && debouncedValue.length >= 0) {
      setIsSearching(true);
      onSearch(debouncedValue);
      if (debouncedValue.trim()) {
        trackSearch(debouncedValue, 0);
      }
      setIsSearching(false);
    }
  }, [debouncedValue, onSearch, trackSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(value);
      setIsFocused(false);
    }
  };

  const clearSearch = () => {
    onChange('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-6 w-6 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Performance optimized sort options with icons
export const ADVANCED_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured', icon: '⭐' },
  { value: 'popularity', label: 'Most Popular', icon: '👁️' },
  { value: 'trending', label: 'Trending Now', icon: '📈' },
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'rating', label: 'Highest Rated', icon: '⭐' },
  { value: 'price-low', label: 'Price: Low to High', icon: '💰' },
  { value: 'price-high', label: 'Price: High to Low', icon: '💎' },
  { value: 'name', label: 'Name A-Z', icon: '🔤' }
] as const;

// Performance metrics component
interface PerformanceMetricsProps {
  loadTime?: number;
  totalProducts: number;
  filteredProducts: number;
  searchTerm?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  loadTime,
  totalProducts,
  filteredProducts,
  searchTerm
}) => {
  return (
    <div className="text-xs text-muted-foreground text-center py-2 border-t">
      <div className="flex justify-center items-center gap-4">
        {loadTime && (
          <span>Loaded in {loadTime}ms</span>
        )}
        <span>
          {filteredProducts} of {totalProducts} products
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
      </div>
    </div>
  );
};