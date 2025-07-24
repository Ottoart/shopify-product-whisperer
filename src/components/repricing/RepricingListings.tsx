import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingsTab } from "./tabs/ListingsTab";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RepricingListings() {
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  
  const [dateRange, setDateRange] = useState("last30days");

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'last7days':
        return 'Last 7 days';
      case 'last30days':
        return 'Last 30 days';
      case 'last6months':
        return 'Last 6 months';
      default:
        return 'Last 30 days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {storeFilter ? `${storeFilter} Product Listings` : 'Product Listings'}
          </h1>
          <p className="text-muted-foreground">
            {storeFilter 
              ? `Manage product listings and prices for ${storeFilter} store` 
              : 'Manage product listings and pricing strategies'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Date Range
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Content */}
      <ListingsTab 
        storeFilter={storeFilter} 
        dateRange={dateRange} 
        dateRangeLabel={getDateRangeLabel()}
        onAddToQueue={(skus) => console.log('Adding to queue:', skus)}
      />
    </div>
  );
}