import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Check, Target, Timer } from 'lucide-react';

interface PatternStats {
  totalPatterns: number;
  approvedPatterns: number;
  avgConfidence: number;
  mostFrequentType: string;
  recentActivity: number;
}

interface PatternStatsOverviewProps {
  stats: PatternStats | null;
}

export const PatternStatsOverview = ({ stats }: PatternStatsOverviewProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 shadow-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Patterns</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalPatterns}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approvedPatterns}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Confidence</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{Math.round(stats.avgConfidence * 100)}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Recent Activity</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.recentActivity}</p>
            </div>
            <Timer className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};