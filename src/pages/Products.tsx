import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Products() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">ProductWhisper System Removed</h2>
            <p className="text-muted-foreground">
              The ProductWhisper system has been removed from this application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}