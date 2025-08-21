import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package } from "lucide-react";

interface QueueItem {
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface DashboardTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
  queueItems: QueueItem[];
  onAddToQueue: (productIds: string[]) => void;
  onUpdateQueueStatus: (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => void;
  onRemoveFromQueue: (productId: string) => void;
}

export function DashboardTab({ 
  storeFilter, 
  dateRange, 
  dateRangeLabel,
  queueItems,
  onAddToQueue,
  onUpdateQueueStatus,
  onRemoveFromQueue
}: DashboardTabProps) {
  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const processingCount = queueItems.filter(item => item.status === 'processing').length;
  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Queue Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{pendingCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Processing</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{processingCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{completedCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-muted-foreground">Errors</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{errorCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Card>
        <CardHeader>
          <CardTitle>Repricing Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Repricing Module</h3>
            <p className="text-muted-foreground">
              Monitor and manage your product repricing strategies across marketplaces.
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