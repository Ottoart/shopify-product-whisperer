import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SearchHighlight, SearchSuggestions, RecentSearches } from './SearchHighlight';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { cn } from '@/lib/utils';

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  debounceMs?: number;
}

const RECENT_SEARCHES_KEY = 'store_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  className,
  showSuggestions = true,
  showRecentSearches = true,
  debounceMs = 300
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { trackSearch } = useAnalyticsTracking();

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (query.trim()) {
          fetchSuggestions(query);
        } else {
          setSuggestions([]);
        }
      }, debounceMs);
    };
  }, [debounceMs]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Debounce suggestions when value changes
  useEffect(() => {
    if (value && isFocused) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
    }
  }, [value, isFocused, debouncedSearch]);

  const fetchSuggestions = async (query: string) => {
    if (!showSuggestions || query.length < 2) return;

    setIsLoadingSuggestions(true);
    try {
      // Get product name suggestions
      const { data: products } = await (supabase as any)
        .from('store_products')
        .select('name, brand, category, tags')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(8);

      if (products) {
        const suggestions = new Set<string>();
        
        products.forEach((product: any) => {
          // Add product names
          if (product.name?.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.name);
          }
          
          // Add brands
          if (product.brand?.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.brand);
          }
          
          // Add categories
          if (product.category?.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.category);
          }
          
          // Add relevant tags
          if (product.tags) {
            product.tags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(tag);
              }
            });
          }
        });

        setSuggestions(Array.from(suggestions).slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    // Track search
    trackSearch(query, { resultsCount: 0 }); // Results count will be updated by parent component
    
    // Add to recent searches
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updatedRecent);
    
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }

    // Execute search
    onSearch(query);
    setIsFocused(false);
    setSuggestions([]);
  }, [onSearch, recentSearches, trackSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const clearSearch = () => {
    onChange('');
    onSearch('');
    setIsFocused(false);
    setSuggestions([]);
  };

  const showSuggestionsDropdown = isFocused && suggestions.length > 0 && value.length >= 2;
  const showRecentDropdown = isFocused && !value && recentSearches.length > 0 && showRecentSearches;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestionsDropdown && (
        <SearchSuggestions
          query={value}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          className="mt-1"
        />
      )}

      {/* Recent Searches */}
      {showRecentDropdown && (
        <RecentSearches
          searches={recentSearches}
          onSearchClick={handleSuggestionClick}
          onClearSearches={clearRecentSearches}
          className="mt-1"
        />
      )}
    </div>
  );
};

// Enhanced Search Results with highlighting
interface SearchResultsProps {
  query: string;
  products: any[];
  children: React.ReactNode;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  products,
  children
}) => {
  if (!query) return <>{children}</>;

  return (
    <div>
      {/* Search Results Header */}
      <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
        <h3 className="font-medium">
          Search Results for "{<SearchHighlight text={query} searchTerm={query} />}"
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Found {products.length} products matching your search
        </p>
      </div>
      
      {children}
    </div>
  );
};