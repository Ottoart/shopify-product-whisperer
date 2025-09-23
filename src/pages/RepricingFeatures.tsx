import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Bot,
  LineChart,
  ShieldCheck,
  Zap,
  Settings,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Price Optimization",
    description: "Our advanced AI algorithms analyze market data, competition, and historical performance to suggest optimal pricing strategies.",
    benefits: [
      "Real-time market analysis",
      "Competitor price tracking",
      "Automatic price adjustments",
      "Smart Buy Box strategy"
    ]
  },
  {
    icon: LineChart,
    title: "Advanced Analytics Dashboard",
    description: "Comprehensive analytics and reporting tools to track your performance and make data-driven decisions.",
    benefits: [
      "Sales performance tracking",
      "Profit margin analysis",
      "Market share insights",
      "Custom report generation"
    ]
  },
  {
    icon: ShieldCheck,
    title: "Profit Protection",
    description: "Sophisticated rules and safeguards to ensure your profitability while staying competitive.",
    benefits: [
      "Minimum profit margins",
      "Cost-based pricing rules",
      "MAP pricing compliance",
      "Inventory level considerations"
    ]
  },
  {
    icon: Zap,
    title: "Real-time Price Updates",
    description: "Lightning-fast price adjustments to keep you competitive in rapidly changing markets.",
    benefits: [
      "Instant price changes",
      "Automated repricing",
      "Market trend monitoring",
      "Competition tracking"
    ]
  },
  {
    icon: Settings,
    title: "Custom Repricing Rules",
    description: "Create and manage custom pricing rules tailored to your business needs.",
    benefits: [
      "Flexible rule creation",
      "Multiple condition support",
      "Time-based pricing",
      "Category-specific rules"
    ]
  },
  {
    icon: BarChart3,
    title: "Performance Monitoring",
    description: "Track the effectiveness of your pricing strategies and optimize for better results.",
    benefits: [
      "Strategy performance metrics",
      "A/B testing capabilities",
      "ROI analysis",
      "Trend identification"
    ]
  }
];

export default function RepricingFeatures() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Powerful Features for Smart Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced tools and features to help you maximize your profits
          </p>
          <Button size="lg" asChild>
            <Link to="/repricing">Try it Now</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">
                      {feature.description}
                    </p>
                  </div>
                  <ul className="grid grid-cols-2 gap-2 mt-4">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to optimize your pricing?</h2>
          <p className="text-muted-foreground">
            Start using our intelligent repricing solution today
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/repricing">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}