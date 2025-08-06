import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, ChevronDown, ChevronUp, X, Star, SlidersHorizontal } from "lucide-react";

interface FilterState {
  search: string;
  category: string;
  brand: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  featured: boolean;
  sortBy: string;
  material: string[];
  color: string[];
  promotionType: string[];
}

interface FilterOptions {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  materials: string[];
  colors: string[];
  maxPrice: number;
}

interface StoreFiltersProps {
  filters: FilterState;
  options: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export default function StoreFilters({
  filters,
  options,
  onFiltersChange,
  onClearFilters,
  activeFilterCount
}: StoreFiltersProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    attributes: false,
    features: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const removeFilterItem = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  return (
    <div className="w-80 min-h-screen bg-card border-r">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {filters.brand.map(brand => (
              <Badge key={brand} variant="secondary" className="text-xs">
                {brand}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeFilterItem('brand', brand)}
                />
              </Badge>
            ))}
            {filters.material.map(material => (
              <Badge key={material} variant="secondary" className="text-xs">
                {material}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeFilterItem('material', material)}
                />
              </Badge>
            ))}
            {filters.color.map(color => (
              <Badge key={color} variant="secondary" className="text-xs">
                {color}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeFilterItem('color', color)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Sort */}
        <div className="p-4 border-b">
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <Collapsible 
          open={openSections.category} 
          onOpenChange={() => toggleSection('category')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Category</Label>
              {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {options.categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Brand */}
        <Collapsible 
          open={openSections.brand} 
          onOpenChange={() => toggleSection('brand')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Brand</Label>
              {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {options.brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brand.includes(brand)}
                    onCheckedChange={() => toggleArrayFilter('brand', brand)}
                  />
                  <Label 
                    htmlFor={`brand-${brand}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible 
          open={openSections.price} 
          onOpenChange={() => toggleSection('price')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Price Range</Label>
              {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={options.maxPrice}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex items-center space-x-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <Collapsible 
          open={openSections.rating} 
          onOpenChange={() => toggleSection('rating')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Rating</Label>
              {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    filters.rating === rating ? 'bg-primary/10' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                >
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">& up</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Attributes */}
        <Collapsible 
          open={openSections.attributes} 
          onOpenChange={() => toggleSection('attributes')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Attributes</Label>
              {openSections.attributes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b space-y-4">
            {/* Material */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Material</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {options.materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={filters.material.includes(material)}
                      onCheckedChange={() => toggleArrayFilter('material', material)}
                    />
                    <Label 
                      htmlFor={`material-${material}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Color</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {options.colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={filters.color.includes(color)}
                      onCheckedChange={() => toggleArrayFilter('color', color)}
                    />
                    <Label 
                      htmlFor={`color-${color}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {color}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Features */}
        <Collapsible 
          open={openSections.features} 
          onOpenChange={() => toggleSection('features')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer">
              <Label className="text-sm font-medium">Features</Label>
              {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => updateFilter('inStock', checked)}
                />
                <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={filters.featured}
                  onCheckedChange={(checked) => updateFilter('featured', checked)}
                />
                <Label htmlFor="featured" className="text-sm cursor-pointer">
                  Featured Products
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}