import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Truck, TrendingUp, Warehouse, CheckCircle } from 'lucide-react';

const modules = [
  {
    id: 'shipping',
    title: 'Shipping Management',
    description: 'Multi-carrier shipping solutions with automated label printing and tracking',
    icon: Truck,
    features: ['Multi-carrier rates', 'Bulk label printing', 'Order tracking', 'Address validation'],
    route: '/shipping-landing',
    dashboardRoute: '/shipping',
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 'repricing',
    title: 'AI Repricing',
    description: 'Intelligent automated repricing with competitor tracking and profit optimization',
    icon: TrendingUp,
    features: ['AI price optimization', 'Competitor monitoring', 'Profit protection', 'Rule automation'],
    route: '/repricing-landing',
    dashboardRoute: '/repricing',
    color: 'bg-green-500',
    status: 'active'
  },
  {
    id: 'fulfillment',
    title: 'Fulfillment Services',
    description: 'Complete 3PL fulfillment with receiving, storage, and pick & pack services',
    icon: Warehouse,
    features: ['3PL warehousing', 'FBA prep', 'Pick & pack', 'Inventory management'],
    route: '/fulfillment-landing',
    dashboardRoute: '/fulfillment-dashboard',
    color: 'bg-purple-500',
    status: 'active'
  },
  {
    id: 'product-management',
    title: 'Product Management',
    description: 'AI-powered product catalog optimization and multi-channel synchronization',
    icon: Package,
    features: ['AI optimization', 'Bulk editing', 'Multi-channel sync', 'Performance analytics'],
    route: '/product-management-landing',
    dashboardRoute: '/products',
    color: 'bg-orange-500',
    status: 'active'
  }
];

const comparisonFeatures = [
  'Multi-carrier shipping rates',
  'AI-powered repricing',
  '3PL fulfillment services',
  'Product catalog optimization',
  'Bulk operations',
  'Real-time analytics',
  'API integrations',
  'Mobile-responsive design'
];

const Index: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            PrepFox Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete e-commerce operations platform with shipping, repricing, fulfillment, and product management solutions
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {modules.map((module) => (
            <Card key={module.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 w-full h-2 ${module.color}`} />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${module.color} text-white`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {module.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button asChild variant="default" className="flex-1">
                      <Link to={module.route}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={module.dashboardRoute}>
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Matrix */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Platform Features Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included across all modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    {modules.map((module) => (
                      <th key={module.id} className="text-center py-3 px-4 min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <module.icon className="h-5 w-5" />
                          <span className="text-sm">{module.title.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{feature}</td>
                      {modules.map((module) => (
                        <td key={module.id} className="text-center py-3 px-4">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Choose a module to begin optimizing your e-commerce operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/auth">
                    Sign Up Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/about-us">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;