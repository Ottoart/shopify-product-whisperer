import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Play, Pause, RotateCcw, CheckCircle, XCircle } from "lucide-react";

export function BatchActionQueue() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(24);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Actions & Queue Management
          </CardTitle>
          <CardDescription>Let me do 50 things in 5 clicks — without errors or waiting blindly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🔄 Generating Labels: 12 of 50 done</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">🚀 Bulk processing started! Sit back and relax.</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">Bulk Label Creation</span>
                <p className="text-sm text-muted-foreground">Generate shipping labels for 25 orders</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
                <Button size="sm" onClick={() => setIsProcessing(!isProcessing)}>
                  <Play className="h-4 w-4 mr-1" />
                  Run Again
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">Apply Shipping Rules</span>
                <p className="text-sm text-muted-foreground">🧠 Thinking... carrier rules are being applied</p>
              </div>
              <Badge variant="secondary">
                <RotateCcw className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-medium text-green-800">✅ Done! 48 labels created. 2 failed — see log.</p>
            <p className="text-sm text-green-600 mt-1">Good things take time. Just like perfect espresso ☕</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}