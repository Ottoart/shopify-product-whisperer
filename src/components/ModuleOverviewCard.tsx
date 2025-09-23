import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleOverviewCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  metrics: {
    primary: {
      label: string;
      value: string | number;
      change?: number;
      trend?: 'up' | 'down' | 'neutral';
    };
    secondary: {
      label: string;
      value: string | number;
    }[];
  };
  quickActions: {
    label: string;
    path: string;
    variant?: 'default' | 'outline' | 'secondary';
  }[];
  recentActivity?: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  healthScore?: number;
  alertsCount?: number;
  // Subscription-related props
  enabled: boolean;
  upgradeRequired?: boolean;
  usagePercent?: number;
  primaryCTA?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
}

export function ModuleOverviewCard({
  title,
  description,
  icon,
  metrics,
  quickActions,
  recentActivity = [],
  healthScore,
  alertsCount = 0,
  enabled,
  upgradeRequired = false,
  usagePercent,
  primaryCTA
}: ModuleOverviewCardProps) {
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracking();

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const handleCardClick = () => {
    trackEvent({
      event_type: 'module_card_view',
      data: {
        module: title,
        enabled
      }
    });
  };

  const handleActionClick = (action: string) => {
    trackEvent({
      event_type: 'module_card_action',
      data: {
        module: title,
        action,
        enabled
      }
    });
    navigate(action);
  };

  return (
    <Card className={`relative overflow-hidden ${!enabled ? 'opacity-60' : ''}`} onClick={handleCardClick}>
      {alertsCount > 0 && enabled && (
        <div className="absolute top-4 right-4">
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {alertsCount}
          </Badge>
        </div>
      )}
      
      {upgradeRequired && (
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-700 border-orange-200">
            <Zap className="h-3 w-3" />
            Upgrade Required
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        
        {healthScore !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Health Score</span>
              <span className="font-medium">{healthScore}%</span>
            </div>
            <Progress 
              value={healthScore} 
              className="h-2"
              style={{
                '--progress-foreground': getHealthScoreColor(healthScore)
              } as React.CSSProperties}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Metric */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{metrics.primary.label}</span>
            {getTrendIcon(metrics.primary.trend)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{metrics.primary.value}</span>
            {metrics.primary.change !== undefined && (
              <span className={`text-sm ${getTrendColor(metrics.primary.trend)}`}>
                {metrics.primary.change > 0 ? '+' : ''}{metrics.primary.change}%
              </span>
            )}
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.secondary.map((metric, index) => (
            <div key={index} className="space-y-1">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <div className="font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Recent Activity
            </div>
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">
                    {activity.description}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Progress */}
        {usagePercent !== undefined && enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Usage this month</span>
              <span className="font-medium">{usagePercent}%</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        )}

        {/* Primary CTA */}
        {primaryCTA && (
          <div className="pt-2 border-t">
            <Button
              variant={primaryCTA.variant || 'default'}
              size="sm"
              className="w-full"
              onClick={primaryCTA.onClick}
              disabled={!enabled && !upgradeRequired}
            >
              {primaryCTA.label}
              {upgradeRequired && <Zap className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                className="w-full justify-between"
                onClick={() => handleActionClick(action.path)}
                disabled={!enabled}
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}