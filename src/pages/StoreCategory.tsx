import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ShoppingCart, Search, Package, Star, ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  image_url?: string;
  category: string;
  subcategory?: string;
  supplier: string;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
}

export default function StoreCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const session = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [category, setCategory] = useState<StoreCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    if (categorySlug) {
      fetchCategory();
      fetchProducts();
    }
  }, [categorySlug]);

  const fetchCategory = async () => {
    try {
      // Mock category data since ProductWhisper tables were removed
      setCategory({
        id: '1',
        name: 'ProductWhisper System Removed',
        slug: categorySlug || 'removed',
        description: 'The ProductWhisper system and its store functionality have been removed from this application.'
      });
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Mock empty products since ProductWhisper tables were removed
      setProducts([]);
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

  const handleAddToCart = (product: StoreProduct) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "ProductWhisper System Removed",
      description: "Store functionality has been removed from this application.",
      variant: "destructive",
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-96 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/store">Store</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium">{category?.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/store">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-foreground">{category?.name}</h1>
        </div>
        {category?.description && (
          <p className="text-muted-foreground text-lg">
            {category.description}
          </p>
        )}
      </div>

      {/* System Removed Notice */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ProductWhisper System Removed</h3>
            <p className="text-muted-foreground">
              The ProductWhisper system and its store functionality have been removed from this application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}