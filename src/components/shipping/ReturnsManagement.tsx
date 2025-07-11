import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Package, CheckCircle, Clock } from "lucide-react";

export function ReturnsManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Returns Management Portal
          </CardTitle>
          <CardDescription>Easy returns for customers. Hassle-free management for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Pending Returns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">In Transit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Button>💙 Start a Return — We're here to help</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}