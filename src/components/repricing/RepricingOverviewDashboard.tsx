import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardTab } from "./tabs/DashboardTab";
import { ListingsTab } from "./tabs/ListingsTab";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RepricingOverviewDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [dateRange, setDateRange] = useState("last30days");

  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
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

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="text-sm font-medium">
            💰 Dashboard
          </TabsTrigger>
          <TabsTrigger value="listings" className="text-sm font-medium">
            📄 Listings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab 
            storeFilter={storeFilter} 
            dateRange={dateRange} 
            dateRangeLabel={getDateRangeLabel()} 
          />
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <ListingsTab 
            storeFilter={storeFilter} 
            dateRange={dateRange} 
            dateRangeLabel={getDateRangeLabel()} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}