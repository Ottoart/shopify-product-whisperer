import { RotateCcw } from "lucide-react";
import { ComprehensiveReturnsManagement } from "@/components/shipping/ComprehensiveReturnsManagement";

export default function ReturnsPortal() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Returns Portal</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Handle returns and refunds</p>
        </div>
      </div>

      {/* Returns Management */}
      <ComprehensiveReturnsManagement />
    </div>
  );
}