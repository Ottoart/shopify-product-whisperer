import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';

interface AIRecommendationsProps {
  orders: any[];
  carriers: any[];
}

export function AIRecommendations({ orders, carriers }: AIRecommendationsProps) {
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Check for SLA breaches
    const oldOrders = orders.filter(order => {
      if (order.status !== 'awaiting' && order.status !== 'processing') return false;
      const orderDate = parseISO(order.order_date);
      const daysOld = differenceInDays(new Date(), orderDate);
      return daysOld > 2;
    });

    if (oldOrders.length > 0) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'SLA Risk Alert',
        description: `${oldOrders.length} orders are at risk of SLA breach (>2 days old)`,
        action: 'Review aging orders',
        priority: 'high'
      });
    }

    // Check carrier distribution
    if (carriers.length > 0) {
      const topCarrier = carriers[0];
      if (topCarrier.share > 70) {
        recommendations.push({
          type: 'info',
          icon: TrendingUp,
          title: 'Carrier Diversification',
          description: `${topCarrier.name} handles ${topCarrier.share}% of shipments. Consider diversifying to reduce risk.`,
          action: 'Explore alternatives',
          priority: 'medium'
        });
      }
    }

    // Batch processing recommendation
    const todaysOrders = orders.filter(order => {
      const orderDate = parseISO(order.order_date);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && 
             (order.status === 'awaiting' || order.status === 'processing');
    });

    if (todaysOrders.length >= 5) {
      recommendations.push({
        type: 'success',
        icon: Clock,
        title: 'Batch Processing Opportunity',
        description: `${todaysOrders.length} orders ready for batch fulfillment to reduce label costs.`,
        action: 'Start batch process',
        priority: 'medium'
      });
    }

    // Cost optimization
    const shippingCosts = orders.filter(o => o.shipping_cost).map(o => o.shipping_cost);
    if (shippingCosts.length > 0) {
      const avgCost = shippingCosts.reduce((sum, cost) => sum + cost, 0) / shippingCosts.length;
      if (avgCost > 10) {
        recommendations.push({
          type: 'info',
          icon: DollarSign,
          title: 'Cost Optimization',
          description: `Average shipping cost is $${avgCost.toFixed(2)}. Review carrier rates for potential savings.`,
          action: 'Review rates',
          priority: 'low'
        });
      }
    }

    return recommendations.slice(0, 3); // Show top 3 recommendations
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gradient-primary border-0">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <Brain className="h-5 w-5" />
            🧠 AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-primary-foreground opacity-90">
            All systems operating efficiently! No immediate recommendations at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getVariantForType = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card className="bg-gradient-primary border-0">
      <CardHeader>
        <CardTitle className="text-primary-foreground flex items-center gap-2">
          <Brain className="h-5 w-5" />
          🧠 AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <rec.icon className={`h-5 w-5 mt-0.5 ${getPriorityColor(rec.priority)}`} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-primary-foreground">{rec.title}</h4>
                    <Badge 
                      variant={getVariantForType(rec.type)}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-primary-foreground/90 text-sm">{rec.description}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xs bg-white/20 hover:bg-white/30 border-white/20"
              >
                {rec.action}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}