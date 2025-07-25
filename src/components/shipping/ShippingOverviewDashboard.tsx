import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { OperationsTab } from "./tabs/OperationsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ShippingOverviewDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const activeTab = searchParams.get('tab') || 'overview';
  
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
      case 'thismonth':
        return 'This month';
      default:
        return 'Last 30 days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">
            {storeFilter ? `${storeFilter} Shipping Dashboard` : 'Shipping Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {storeFilter 
              ? `Comprehensive shipping analytics for ${storeFilter} store` 
              : 'Comprehensive shipping analytics and operations management'
            }
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Date Range</span>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thismonth">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-sm font-medium">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-sm font-medium">
            ⚙️ Operations
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm font-medium">
            📁 Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            storeFilter={storeFilter} 
            dateRange={dateRange} 
            dateRangeLabel={getDateRangeLabel()} 
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <OperationsTab 
            storeFilter={storeFilter} 
            dateRange={dateRange} 
            dateRangeLabel={getDateRangeLabel()} 
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsTab 
            storeFilter={storeFilter} 
            dateRange={dateRange} 
            dateRangeLabel={getDateRangeLabel()} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}