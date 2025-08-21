import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ResponsiveMobileStore from "@/components/store/ResponsiveMobileStore";
import StoreBreadcrumb from "@/components/store/StoreBreadcrumb";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";

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
  const { trackProductView, trackCartAdd } = useAnalyticsTracking();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    trackCartAdd(product.id, { page: 'store' });
    await addToCart(product.id);
  };

  const handleAddToWishlist = async (product: StoreProduct) => {
    await toggleWishlist(product.id);
  };

  const handleProductClick = (product: StoreProduct) => {
    trackProductView(product.id);
  };

  const handleAddToComparison = (product: StoreProduct) => {
    // Comparison functionality handled by ResponsiveMobileStore
    toast({
      title: "Feature Coming Soon",
      description: "Product comparison will be available soon",
    });
  };

  const isInComparison = (productId: string) => {
    return false;
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentCategoryInfo = getCurrentCategoryInfo();

  return (
    <ResponsiveMobileStore
      products={sortedProducts}
      filters={filters}
      options={filterOptions}
      onFiltersChange={setFilters}
      onClearFilters={clearAllFilters}
      activeFilterCount={getActiveFilterCount()}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleAddToWishlist}
      onAddToCompare={handleAddToComparison}
      isInWishlist={isInWishlist}
      isInComparison={isInComparison}
      onRefresh={fetchProducts}
      isLoading={loading}
    />
  );
}