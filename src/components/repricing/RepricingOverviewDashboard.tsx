import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardTab } from "./tabs/DashboardTab";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueueItem {
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export function RepricingOverviewDashboard() {
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  
  const [dateRange, setDateRange] = useState("last30days");
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  // Queue management functions
  const addToQueue = (productIds: string[]) => {
    const newItems = productIds.map(id => ({
      productId: id,
      status: 'pending' as const
    }));
    setQueueItems(prev => [...prev, ...newItems]);
  };

  const updateQueueItemStatus = (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => {
    setQueueItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, status, error } : item
    ));
  };

  const removeFromQueue = (productId: string) => {
    setQueueItems(prev => prev.filter(item => item.productId !== productId));
  };

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
            {storeFilter ? `${storeFilter} Repricing Dashboard` : 'Repricing Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {storeFilter 
              ? `Cross-marketplace pricing insights for ${storeFilter} store` 
              : 'AI-powered pricing optimization and Buy Box analytics'
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

      {/* Dashboard Content */}
      <DashboardTab 
        storeFilter={storeFilter} 
        dateRange={dateRange} 
        dateRangeLabel={getDateRangeLabel()}
        queueItems={queueItems}
        onAddToQueue={addToQueue}
        onUpdateQueueStatus={updateQueueItemStatus}
        onRemoveFromQueue={removeFromQueue}
      />
    </div>
  );
}