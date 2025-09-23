import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingUp, AlertTriangle, Target, DollarSign, Lightbulb } from "lucide-react";

export function RepricingAIRecommendations() {
  const recommendations = [
    {
      type: "optimize",
      priority: "high",
      title: "Raise Price Floor for Top Sellers",
      description: "15 products winning Buy Box consistently can support 8-12% price increase",
      action: "Review Products",
      icon: TrendingUp,
      color: "green"
    },
    {
      type: "alert",
      priority: "medium",
      title: "Negative Margin Risk",
      description: "3 high-cost listings showing negative margin after fees",
      action: "Check Pricing",
      icon: AlertTriangle,
      color: "red"
    },
    {
      type: "strategy",
      priority: "low",
      title: "Competitor Undercut Pattern",
      description: "Competitor X has undercut 12 of your listings in the past week",
      action: "Adjust Strategy",
      icon: Target,
      color: "blue"
    },
    {
      type: "opportunity",
      priority: "medium",
      title: "Slow Mover Strategy Shift",
      description: "8 products with <2 sales/month may benefit from aggressive pricing",
      action: "View Listings",
      icon: Lightbulb,
      color: "orange"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Smart insights to optimize your pricing strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <Alert key={index} className="p-4">
            <div className="flex items-start gap-3">
              <rec.icon className={`h-5 w-5 mt-0.5 ${getIconColor(rec.color)}`} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                    {rec.priority}
                  </Badge>
                </div>
                <AlertDescription className="text-xs text-muted-foreground">
                  {rec.description}
                </AlertDescription>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  {rec.action}
                </Button>
              </div>
            </div>
          </Alert>
        ))}
        
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View All Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}