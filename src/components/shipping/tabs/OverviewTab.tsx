import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Truck } from "lucide-react";

interface OverviewTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
}

export function OverviewTab({ storeFilter, dateRange, dateRangeLabel }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Shipped</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Shipping Cost</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">$0.00</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Cost</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">$0.00</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Overview Content */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Shipping Dashboard</h3>
            <p className="text-muted-foreground">
              Monitor shipping performance and analytics across all your orders.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Viewing data for: {dateRangeLabel}
              {storeFilter && ` • Store: ${storeFilter}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}