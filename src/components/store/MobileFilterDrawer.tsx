import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  SlidersHorizontal, 
  X, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Tag, 
  Star, 
  Settings,
  Filter,
  Palette,
  CheckSquare2
} from "lucide-react";

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

interface MobileFilterDrawerProps {
  filters: FilterState;
  options: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MobileFilterDrawer({
  filters,
  options,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  trigger,
  open,
  onOpenChange
}: MobileFilterDrawerProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: false,
    price: false,
    rating: false,
    attributes: false,
    features: false
  });

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateLocalFilter = (key: keyof FilterState, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = localFilters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateLocalFilter(key, newArray);
  };

  const removeFilterItem = (key: keyof FilterState, value: string) => {
    const currentArray = localFilters[key] as string[];
    updateLocalFilter(key, currentArray.filter(item => item !== value));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange?.(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      category: "all",
      brand: [],
      priceRange: [0, options.maxPrice] as [number, number],
      rating: 0,
      inStock: false,
      featured: false,
      sortBy: "featured",
      material: [],
      color: [],
      promotionType: []
    };
    setLocalFilters(defaultFilters);
    onClearFilters();
  };

  const getLocalActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category !== "all") count++;
    if (localFilters.brand.length > 0) count += localFilters.brand.length;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < options.maxPrice) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.inStock) count++;
    if (localFilters.featured) count++;
    if (localFilters.material.length > 0) count += localFilters.material.length;
    if (localFilters.color.length > 0) count += localFilters.color.length;
    return count;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <span>Filters</span>
              {getLocalActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getLocalActiveFilterCount()}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-8"
            >
              Reset
            </Button>
          </DrawerTitle>
          <DrawerDescription>
            Refine your search with filters below
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-4">
            {/* Search */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Label>
              <Input
                placeholder="Search products..."
                value={localFilters.search}
                onChange={(e) => updateLocalFilter('search', e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <Separator />

            {/* Sort */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sort By
              </Label>
              <Select value={localFilters.sortBy} onValueChange={(value) => updateLocalFilter('sortBy', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Category */}
            <Collapsible 
              open={openSections.category} 
              onOpenChange={() => toggleSection('category')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium">Category</span>
                  </div>
                  {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Select value={localFilters.category} onValueChange={(value) => updateLocalFilter('category', value)}>
                  <SelectTrigger className="h-11">
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

            <Separator />

            {/* Brand */}
            <Collapsible 
              open={openSections.brand} 
              onOpenChange={() => toggleSection('brand')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium">Brand</span>
                    {localFilters.brand.length > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {localFilters.brand.length}
                      </Badge>
                    )}
                  </div>
                  {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {options.brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-3">
                      <Checkbox
                        id={`mobile-brand-${brand}`}
                        checked={localFilters.brand.includes(brand)}
                        onCheckedChange={() => toggleArrayFilter('brand', brand)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor={`mobile-brand-${brand}`} 
                        className="text-sm cursor-pointer flex-1 py-2"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Price Range */}
            <Collapsible 
              open={openSections.price} 
              onOpenChange={() => toggleSection('price')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">$</span>
                    <span className="font-medium">Price Range</span>
                  </div>
                  {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={localFilters.priceRange}
                      onValueChange={(value) => updateLocalFilter('priceRange', value as [number, number])}
                      max={options.maxPrice}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center font-medium text-primary bg-primary/10 rounded-lg py-3">
                    ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Rating */}
            <Collapsible 
              open={openSections.rating} 
              onOpenChange={() => toggleSection('rating')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">Rating</span>
                  </div>
                  {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <Button
                      key={rating}
                      variant={localFilters.rating === rating ? "default" : "outline"}
                      className="w-full justify-start h-11"
                      onClick={() => updateLocalFilter('rating', localFilters.rating === rating ? 0 : rating)}
                    >
                      <div className="flex items-center gap-2">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ))}
                        <span className="ml-2">{rating}+ Stars</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Material & Color */}
            <Collapsible 
              open={openSections.attributes} 
              onOpenChange={() => toggleSection('attributes')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-medium">Attributes</span>
                    {(localFilters.material.length + localFilters.color.length) > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {localFilters.material.length + localFilters.color.length}
                      </Badge>
                    )}
                  </div>
                  {openSections.attributes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-4">
                {/* Materials */}
                {options.materials.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Material</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {options.materials.map((material) => (
                        <div key={material} className="flex items-center space-x-3">
                          <Checkbox
                            id={`mobile-material-${material}`}
                            checked={localFilters.material.includes(material)}
                            onCheckedChange={() => toggleArrayFilter('material', material)}
                          />
                          <Label 
                            htmlFor={`mobile-material-${material}`} 
                            className="text-sm cursor-pointer flex-1 py-1"
                          >
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {options.colors.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Color</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {options.colors.map((color) => (
                        <div key={color} className="flex items-center space-x-3">
                          <Checkbox
                            id={`mobile-color-${color}`}
                            checked={localFilters.color.includes(color)}
                            onCheckedChange={() => toggleArrayFilter('color', color)}
                          />
                          <Label 
                            htmlFor={`mobile-color-${color}`} 
                            className="text-sm cursor-pointer flex-1 py-1"
                          >
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Features */}
            <Collapsible 
              open={openSections.features} 
              onOpenChange={() => toggleSection('features')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Features</span>
                  </div>
                  {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="mobile-in-stock"
                    checked={localFilters.inStock}
                    onCheckedChange={(checked) => updateLocalFilter('inStock', checked)}
                  />
                  <Label htmlFor="mobile-in-stock" className="text-sm cursor-pointer py-2">
                    In Stock Only
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="mobile-featured"
                    checked={localFilters.featured}
                    onCheckedChange={(checked) => updateLocalFilter('featured', checked)}
                  />
                  <Label htmlFor="mobile-featured" className="text-sm cursor-pointer py-2">
                    Featured Products
                  </Label>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <DrawerFooter className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-12"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={applyFilters}
              className="h-12"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
              {getLocalActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                  {getLocalActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}