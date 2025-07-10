import { Activity as ActivityIcon, Clock, User, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Activity = () => {
  const mockActivities = [
    {
      id: 1,
      type: 'edit',
      action: 'Updated product title',
      product: 'Wireless Headphones',
      user: 'You',
      timestamp: '2 minutes ago',
      icon: Edit,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'delete',
      action: 'Deleted product',
      product: 'Old Phone Case',
      user: 'You',
      timestamp: '15 minutes ago',
      icon: Trash2,
      color: 'bg-red-500'
    },
    {
      id: 3,
      type: 'sync',
      action: 'Synced from Shopify',
      product: '50 products',
      user: 'System',
      timestamp: '1 hour ago',
      icon: ActivityIcon,
      color: 'bg-green-500'
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>
          <p className="text-muted-foreground">Track all product changes and system activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest changes to your product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className={`p-2 rounded-full ${activity.color}`}>
                    <activity.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Product: <span className="font-medium">{activity.product}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{activity.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Activity Features</CardTitle>
            <CardDescription>
              Track comprehensive product management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Real-time product edit tracking</li>
              <li>Bulk operation history</li>
              <li>Sync operation logs</li>
              <li>User activity monitoring</li>
              <li>Change rollback capabilities (coming soon)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activity;