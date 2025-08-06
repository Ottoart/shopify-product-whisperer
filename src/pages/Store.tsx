import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EnhancedStoreFilters from "@/components/store/EnhancedStoreFilters";
import EnhancedProductGrid from "@/components/store/EnhancedProductGrid";
import StoreBreadcrumb from "@/components/store/StoreBreadcrumb";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useWishlist } from "@/hooks/useWishlist";

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sale_price?: number;
  currency: string;
  image_url?: string;
  images?: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  supplier: string;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  rating_average?: number;
  rating_count?: number;
  review_count?: number;
  promotion_type?: string;
  delivery_time_days?: number;
  warranty_info?: string;
  material?: string;
  color?: string;
  size?: string;
  specifications?: any;
  shipping_info?: any;
  created_at?: string;
  updated_at?: string;
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
}

export default function Store() {
  const session = useSession();
  const { toast } = useToast();
  const { addToCart } = useShoppingCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    brand: [] as string[],
    priceRange: [0, 1000] as [number, number],
    rating: 0,
    inStock: false,
    featured: false,
    sortBy: "featured",
    material: [] as string[],
    color: [] as string[],
    promotionType: [] as string[]
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as { id: string; name: string; slug: string }[],
    brands: [] as string[],
    materials: [] as string[],
    colors: [] as string[],
    maxPrice: 1000
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('featured', { ascending: false })
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      
      // Extract unique values for filters
      const uniqueBrands = [...new Set(data?.map(p => p.brand).filter(Boolean))] as string[];
      const uniqueMaterials = [...new Set(data?.map(p => p.material).filter(Boolean))] as string[];
      const uniqueColors = [...new Set(data?.map(p => p.color).filter(Boolean))] as string[];
      const maxPrice = Math.max(...(data?.map(p => p.price) || [1000]));
      
      setFilterOptions(prev => ({
        ...prev,
        brands: uniqueBrands,
        materials: uniqueMaterials,
        colors: uniqueColors,
        maxPrice: Math.ceil(maxPrice / 100) * 100 // Round up to nearest 100
      }));

      // Update price range if needed
      if (filters.priceRange[1] < maxPrice) {
        setFilters(prev => ({
          ...prev,
          priceRange: [prev.priceRange[0], Math.ceil(maxPrice / 100) * 100]
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
      setFilterOptions(prev => ({
        ...prev,
        categories: data?.map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug })) || []
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = async (product: StoreProduct) => {
    await addToCart(product.id);
  };

  const handleAddToWishlist = async (product: StoreProduct) => {
    await toggleWishlist(product.id);
  };

  // Advanced filtering logic
  const filteredProducts = products.filter(product => {
    // Search
    const matchesSearch = filters.search === '' || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())) ||
      product.brand?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category
    const matchesCategory = filters.category === "all" || 
      product.category === filters.category ||
      product.subcategory === filters.category;

    // Brand
    const matchesBrand = filters.brand.length === 0 || 
      (product.brand && filters.brand.includes(product.brand));

    // Price Range
    const price = product.sale_price || product.price;
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

    // Rating
    const matchesRating = filters.rating === 0 || 
      (product.rating_average && product.rating_average >= filters.rating);

    // Stock
    const matchesStock = !filters.inStock || product.in_stock;

    // Featured
    const matchesFeatured = !filters.featured || product.featured;

    // Material
    const matchesMaterial = filters.material.length === 0 || 
      (product.material && filters.material.includes(product.material));

    // Color
    const matchesColor = filters.color.length === 0 || 
      (product.color && filters.color.includes(product.color));

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && 
           matchesRating && matchesStock && matchesFeatured && matchesMaterial && matchesColor;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        const priceA = a.sale_price || a.price;
        const priceB = b.sale_price || b.price;
        return priceA - priceB;
      case 'price-high':
        const priceHighA = a.sale_price || a.price;
        const priceHighB = b.sale_price || b.price;
        return priceHighB - priceHighA;
      case 'rating':
        return (b.rating_average || 0) - (a.rating_average || 0);
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "all") count++;
    if (filters.brand.length > 0) count += filters.brand.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < filterOptions.maxPrice) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    if (filters.material.length > 0) count += filters.material.length;
    if (filters.color.length > 0) count += filters.color.length;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "all",
      brand: [],
      priceRange: [0, filterOptions.maxPrice] as [number, number],
      rating: 0,
      inStock: false,
      featured: false,
      sortBy: "featured",
      material: [],
      color: [],
      promotionType: []
    });
  };

  // Get current category info for breadcrumb
  const getCurrentCategoryInfo = () => {
    if (filters.category === "all") return null;
    
    const category = categories.find(cat => cat.slug === filters.category);
    if (!category) return null;
    
    return {
      name: category.name,
      slug: category.slug
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-card border-r transition-all duration-300`}>
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <StoreBreadcrumb />
            <div className="p-6">
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <EnhancedProductGrid
                products={[]}
                totalProducts={0}
                isLoading={true}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                isInWishlist={isInWishlist}
                sortBy={filters.sortBy}
                onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
                activeFilterCount={getActiveFilterCount()}
                onClearFilters={clearAllFilters}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCategoryInfo = getCurrentCategoryInfo();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Enhanced Sidebar Filters */}
      <EnhancedStoreFilters
        filters={filters}
        options={filterOptions}
        onFiltersChange={setFilters}
        onClearFilters={clearAllFilters}
        activeFilterCount={getActiveFilterCount()}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {/* Breadcrumb Navigation */}
          <StoreBreadcrumb 
            currentCategory={filters.category}
            categoryHierarchy={currentCategoryInfo ? [currentCategoryInfo] : []}
          />
          
          <div className="p-6">
            {/* Store Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">PrepFox Store</h1>
                    <p className="text-muted-foreground">
                      Professional shipping supplies and storage solutions
                    </p>
                  </div>
                </div>
                
                {/* Mobile Sidebar Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Product Grid */}
            <EnhancedProductGrid
              products={sortedProducts}
              totalProducts={products.length}
              isLoading={loading}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={isInWishlist}
              sortBy={filters.sortBy}
              onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
              activeFilterCount={getActiveFilterCount()}
              onClearFilters={clearAllFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}