import { Loader2, Package, Truck, Calculator, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  stage: 'validating' | 'calculating' | 'purchasing' | 'processing' | 'complete';
  progress?: number;
  message?: string;
  details?: string[];
  estimatedTime?: number;
}

export function ShippingLoadingStates({
  stage,
  progress = 0,
  message,
  details = [],
  estimatedTime
}: LoadingStateProps) {
  const getStageInfo = (currentStage: LoadingStateProps['stage']) => {
    switch (currentStage) {
      case 'validating':
        return {
          icon: <Calculator className="h-4 w-4" />,
          title: "Validating Shipment",
          description: "Checking addresses and package details...",
          color: "blue"
        };
      case 'calculating':
        return {
          icon: <Truck className="h-4 w-4" />,
          title: "Calculating Rates",
          description: "Getting quotes from carriers...",
          color: "orange"
        };
      case 'purchasing':
        return {
          icon: <Package className="h-4 w-4" />,
          title: "Purchasing Label",
          description: "Creating shipping label...",
          color: "purple"
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          title: "Processing",
          description: "Finalizing shipment...",
          color: "green"
        };
      case 'complete':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          title: "Complete",
          description: "Shipment processed successfully!",
          color: "green"
        };
    }
  };

  const stageInfo = getStageInfo(stage);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-${stageInfo.color}-100`}>
            {stageInfo.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{stageInfo.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {message || stageInfo.description}
            </p>
          </div>
          {estimatedTime && (
            <Badge variant="outline" className="text-xs">
              ~{estimatedTime}s
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {details.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Processing steps:</h4>
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RateCalculationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ShipmentCreationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}