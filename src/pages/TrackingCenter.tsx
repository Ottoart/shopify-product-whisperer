import { EnhancedTrackingDashboard } from "@/components/shipping/EnhancedTrackingDashboard";
import { MapPin } from "lucide-react";

export default function TrackingCenter() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Tracking Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor and track all shipment statuses in real-time</p>
        </div>
      </div>

      {/* Tracking Dashboard */}
      <EnhancedTrackingDashboard />
    </div>
  );
}