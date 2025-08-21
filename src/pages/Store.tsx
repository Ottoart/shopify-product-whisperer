import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Store() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">ProductWhisper System Removed</h1>
              <p className="text-muted-foreground mb-6">
                The ProductWhisper system has been removed from this application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}