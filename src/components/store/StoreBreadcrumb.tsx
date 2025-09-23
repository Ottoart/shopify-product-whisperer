import { ChevronRight, Home, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface StoreBreadcrumbProps {
  currentCategory?: string;
  categoryHierarchy?: { name: string; slug: string }[];
}

export default function StoreBreadcrumb({ 
  currentCategory, 
  categoryHierarchy = [] 
}: StoreBreadcrumbProps) {
  const location = useLocation();

  const formatCategoryName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-muted/30 border-b">
      <div className="px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Home className="h-3 w-3" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>

            {/* Store */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/store" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Store className="h-3 w-3" />
                  Store
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* Category Hierarchy */}
            {categoryHierarchy.length > 0 && (
              <>
                {categoryHierarchy.map((category, index) => (
                  <div key={category.slug} className="flex items-center">
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3 w-3" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {index === categoryHierarchy.length - 1 ? (
                        <BreadcrumbPage className="font-medium">
                          {category.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={`/store?category=${category.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </>
            )}

            {/* Current Category (if not in hierarchy) */}
            {currentCategory && currentCategory !== "all" && categoryHierarchy.length === 0 && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {formatCategoryName(currentCategory)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}