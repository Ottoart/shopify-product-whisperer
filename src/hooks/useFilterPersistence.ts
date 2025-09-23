import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FilterState {
  search?: string;
  category?: string;
  brand?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  material?: string[];
  color?: string[];
  sortBy?: string;
}

interface UseFilterPersistenceReturn {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  getActiveFilterCount: () => number;
}

const STORAGE_KEY = 'store_filters';

export const useFilterPersistence = (
  defaultFilters: FilterState = {}
): UseFilterPersistenceReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Load filters from URL and localStorage on mount
  useEffect(() => {
    const urlFilters: FilterState = {};
    
    // Parse URL parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const rating = searchParams.get('rating');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const material = searchParams.get('material');
    const color = searchParams.get('color');
    const sortBy = searchParams.get('sortBy');

    if (search) urlFilters.search = search;
    if (category) urlFilters.category = category;
    if (brand) urlFilters.brand = brand.split(',');
    if (priceMin && priceMax) urlFilters.priceRange = [parseFloat(priceMin), parseFloat(priceMax)];
    if (rating) urlFilters.rating = parseInt(rating);
    if (inStock) urlFilters.inStock = inStock === 'true';
    if (featured) urlFilters.featured = featured === 'true';
    if (material) urlFilters.material = material.split(',');
    if (color) urlFilters.color = color.split(',');
    if (sortBy) urlFilters.sortBy = sortBy;

    // Load from localStorage as fallback
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      const parsedFilters = savedFilters ? JSON.parse(savedFilters) : {};
      
      // URL takes precedence over localStorage
      const combinedFilters = { ...defaultFilters, ...parsedFilters, ...urlFilters };
      setFilters(combinedFilters);
    } catch (error) {
      console.error('Error loading saved filters:', error);
      setFilters({ ...defaultFilters, ...urlFilters });
    }
  }, []);

  // Save filters to localStorage and update URL
  const persistFilters = useCallback((newFilters: FilterState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }

    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Clear all filter-related params first
    ['search', 'category', 'brand', 'priceMin', 'priceMax', 'rating', 'inStock', 'featured', 'material', 'color', 'sortBy'].forEach(param => {
      newSearchParams.delete(param);
    });

    // Add current filters to URL
    if (newFilters.search) newSearchParams.set('search', newFilters.search);
    if (newFilters.category) newSearchParams.set('category', newFilters.category);
    if (newFilters.brand?.length) newSearchParams.set('brand', newFilters.brand.join(','));
    if (newFilters.priceRange) {
      newSearchParams.set('priceMin', newFilters.priceRange[0].toString());
      newSearchParams.set('priceMax', newFilters.priceRange[1].toString());
    }
    if (newFilters.rating) newSearchParams.set('rating', newFilters.rating.toString());
    if (newFilters.inStock !== undefined) newSearchParams.set('inStock', newFilters.inStock.toString());
    if (newFilters.featured !== undefined) newSearchParams.set('featured', newFilters.featured.toString());
    if (newFilters.material?.length) newSearchParams.set('material', newFilters.material.join(','));
    if (newFilters.color?.length) newSearchParams.set('color', newFilters.color.join(','));
    if (newFilters.sortBy) newSearchParams.set('sortBy', newFilters.sortBy);

    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    persistFilters(newFilters);
  }, [filters, persistFilters]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    persistFilters(defaultFilters);
  }, [defaultFilters, persistFilters]);

  const resetFilters = useCallback(() => {
    setFilters({});
    persistFilters({});
    localStorage.removeItem(STORAGE_KEY);
  }, [persistFilters]);

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterState];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterState];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount
  };
};