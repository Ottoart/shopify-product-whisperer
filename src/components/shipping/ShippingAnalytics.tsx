import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, DollarSign, Clock, TrendingUp } from "lucide-react";

export function ShippingAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Performance Dashboard
          </CardTitle>
          <CardDescription>See where your shipping dollars go and how efficient you are</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">124</div>
                <div className="text-sm text-muted-foreground">Orders Shipped This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">$8.90</div>
                <div className="text-sm text-muted-foreground">Avg Cost/Order</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">2.3</div>
                <div className="text-sm text-muted-foreground">Avg Days to Ship</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">96.2%</div>
                <div className="text-sm text-muted-foreground">On-Time Delivery</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Carriers by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>UPS Ground</span>
                    <Badge>45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>FedEx Express</span>
                    <Badge>32%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>USPS Priority</span>
                    <Badge>23%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Problem Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                    <div className="font-medium text-red-800">18% of FedEx shipments delayed</div>
                    <div className="text-sm text-red-600">Consider switching to UPS for time-sensitive orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}