import { Calculator } from "lucide-react";
import { EnhancedShippingConfiguration } from "@/components/shipping/EnhancedShippingConfiguration";

export default function RateCalculator() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Rate Calculator</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Calculate shipping costs</p>
        </div>
      </div>

      {/* Rate Calculation */}
      <EnhancedShippingConfiguration />
    </div>
  );
}