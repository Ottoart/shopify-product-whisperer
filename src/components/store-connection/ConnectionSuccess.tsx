import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Zap, Package, BarChart3 } from "lucide-react";
import { Marketplace } from "./types";

interface ConnectionSuccessProps {
  marketplace: Marketplace;
  connectionData: any;
  onFinish: () => void;
}

export function ConnectionSuccess({ marketplace, connectionData, onFinish }: ConnectionSuccessProps) {
  // Removed auto-close - popup stays until user clicks a button

  return (
    <div className="space-y-6 text-center">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          {/* Confetti effect */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute bottom-3 left-6 w-1 h-1 bg-red-400 rounded-full animate-bounce delay-200"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-green-600">🎉 Successfully Connected!</h2>
        <p className="text-lg text-muted-foreground">
          Your <strong>{marketplace.name}</strong> store is now linked to PrepFox
        </p>
      </div>

      {/* Store Info Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white p-3 shadow-sm border flex items-center justify-center">
              <img
                src={marketplace.logo}
                alt={`${marketplace.name} logo`}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-lg">{connectionData.store?.store_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{marketplace.name}</Badge>
                <Badge variant="default" className="bg-green-600">Connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Connected {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Sync Products</h4>
              <p className="text-sm text-muted-foreground">Import your product catalog</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium">Optimize Listings</h4>
              <p className="text-sm text-muted-foreground">AI-powered improvements</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Track Performance</h4>
              <p className="text-sm text-muted-foreground">Monitor sales & metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onFinish}>
          View All Stores
        </Button>
        <Button onClick={onFinish} className="gap-2">
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}