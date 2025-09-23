import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Star, Clock, Filter } from "lucide-react";

interface FilterSuggestion {
  type: 'popular' | 'recent' | 'recommended';
  title: string;
  description: string;
  filters: Record<string, any>;
  count?: number;
}

interface FilterSuggestionsProps {
  onApplySuggestion: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

export default function FilterSuggestions({
  onApplySuggestion,
  currentFilters
}: FilterSuggestionsProps) {
  // Sample suggestions - in a real app, these would come from analytics
  const suggestions: FilterSuggestion[] = [
    {
      type: 'popular',
      title: 'Electronics Under $100',
      description: 'Popular price range for electronics',
      filters: { category: 'electronics', priceRange: [0, 100] },
      count: 234
    },
    {
      type: 'popular',
      title: 'Highly Rated Office Supplies',
      description: 'Top-rated office products',
      filters: { category: 'office-supplies', rating: 4 },
      count: 156
    },
    {
      type: 'recommended',
      title: 'Featured Items',
      description: 'Our current featured products',
      filters: { featured: true },
      count: 89
    },
    {
      type: 'recent',
      title: 'In Stock Only',
      description: 'Recently viewed filter',
      filters: { inStock: true },
      count: 445
    }
  ];

  const getIcon = (type: FilterSuggestion['type']) => {
    switch (type) {
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'recommended':
        return <Star className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: FilterSuggestion['type']) => {
    switch (type) {
      case 'popular':
        return 'Popular';
      case 'recent':
        return 'Recent';
      case 'recommended':
        return 'Recommended';
      default:
        return 'Filter';
    }
  };

  const getTypeColor = (type: FilterSuggestion['type']) => {
    switch (type) {
      case 'popular':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'recent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'recommended':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Filter Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getTypeColor(suggestion.type)}`}
                  >
                    {getIcon(suggestion.type)}
                    <span className="ml-1">{getTypeLabel(suggestion.type)}</span>
                  </Badge>
                  {suggestion.count && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.count} items
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-foreground">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplySuggestion(suggestion.filters)}
              className="w-full h-8 text-xs"
            >
              Apply Filter
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}