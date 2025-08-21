import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DuplicateDetectionTool() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplicate Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            ProductWhisper system has been removed from this application.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}