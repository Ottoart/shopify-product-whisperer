import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, ChevronDown, ChevronUp, X, Star, SlidersHorizontal, Package, Tag, Palette, Settings } from "lucide-react";

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

interface EnhancedStoreFiltersProps {
  filters: FilterState;
  options: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function EnhancedStoreFilters({
  filters,
  options,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  isCollapsed = false,
  onToggleCollapse
}: EnhancedStoreFiltersProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    attributes: false,
    features: false
  });

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
    
    // Generate search suggestions based on brands and categories
    if (value.length > 0) {
      const suggestions = [
        ...options.brands.filter(brand => 
          brand.toLowerCase().includes(value.toLowerCase())
        ),
        ...options.categories.map(cat => cat.name).filter(name => 
          name.toLowerCase().includes(value.toLowerCase())
        )
      ].slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilter('search', suggestion);
    setShowSuggestions(false);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 min-h-screen bg-card border-r flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 min-h-screen bg-card border-r">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="text-xs text-muted-foreground">Refine your search</p>
            </div>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Search with Suggestions */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products, brands..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-lg z-50 mt-1">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.brand.map(brand => (
              <Badge key={brand} variant="secondary" className="text-xs">
                {brand}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilterItem('brand', brand)}
                />
              </Badge>
            ))}
            {filters.material.map(material => (
              <Badge key={material} variant="secondary" className="text-xs">
                {material}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilterItem('material', material)}
                />
              </Badge>
            ))}
            {filters.color.map(color => (
              <Badge key={color} variant="secondary" className="text-xs">
                {color}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilterItem('color', color)}
                />
              </Badge>
            ))}
            {filters.category !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {options.categories.find(c => c.slug === filters.category)?.name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                  onClick={() => updateFilter('category', 'all')}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Sort */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Sort By</Label>
          </div>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
              </SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <Collapsible 
          open={openSections.category} 
          onOpenChange={() => toggleSection('category')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Category</Label>
              </div>
              {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="h-9">
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
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Brand</Label>
                {filters.brand.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {filters.brand.length}
                  </Badge>
                )}
              </div>
              {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {options.brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brand.includes(brand)}
                    onCheckedChange={() => toggleArrayFilter('brand', brand)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`brand-${brand}`} 
                    className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
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
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-sm">$</span>
                <Label className="text-sm font-medium">Price Range</Label>
              </div>
              {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={options.maxPrice}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="grid w-full max-w-sm items-center gap-1">
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                      className="h-8 text-sm pl-6"
                      min={0}
                      max={options.maxPrice}
                    />
                  </div>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1">
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                      className="h-8 text-sm pl-6"
                      min={0}
                      max={options.maxPrice}
                    />
                  </div>
                </div>
              </div>
              <div className="text-center text-sm font-medium text-primary bg-primary/10 rounded-lg py-2">
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
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Label className="text-sm font-medium">Rating</Label>
              </div>
              {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b">
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.rating === rating 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-accent/50 border border-transparent'
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
                  <span className="text-sm font-medium">& up</span>
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
            <div className="flex items-center justify-between p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Attributes</Label>
              </div>
              {openSections.attributes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-b space-y-6">
            {/* Material */}
            <div>
              <Label className="text-xs font-medium mb-3 block text-muted-foreground">MATERIAL</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {options.materials.map((material) => (
                  <div key={material} className="flex items-center space-x-3 group">
                    <Checkbox
                      id={`material-${material}`}
                      checked={filters.material.includes(material)}
                      onCheckedChange={() => toggleArrayFilter('material', material)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`material-${material}`} 
                      className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
                    >
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Color */}
            <div>
              <Label className="text-xs font-medium mb-3 block text-muted-foreground">COLOR</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {options.colors.map((color) => (
                  <div key={color} className="flex items-center space-x-3 group">
                    <Checkbox
                      id={`color-${color}`}
                      checked={filters.color.includes(color)}
                      onCheckedChange={() => toggleArrayFilter('color', color)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`color-${color}`} 
                      className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full border border-muted-foreground/20`}
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                      </div>
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
            <div className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Features</Label>
              </div>
              {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => updateFilter('inStock', checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="in-stock" className="text-sm cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    In Stock Only
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="featured"
                  checked={filters.featured}
                  onCheckedChange={(checked) => updateFilter('featured', checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="featured" className="text-sm cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    Featured Products
                  </div>
                </Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}