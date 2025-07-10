import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { LearningDashboard } from '@/components/LearningDashboard';
import { ProductAnalytics } from '@/components/ProductAnalytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Home, Brain, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrepFoxDashboard = () => {
  const { session } = useSessionContext();

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary-foreground">
              <BarChart3 className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">AI Analytics Hub</h1>
                <p className="text-primary-foreground/80">Comprehensive product analysis and AI-powered insights</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Home className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Product Analytics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <ProductAnalytics />
          </TabsContent>

          <TabsContent value="learning">
            <LearningDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrepFoxDashboard;