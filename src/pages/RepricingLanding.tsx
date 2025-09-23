import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { RepricingNavbar } from "@/components/repricing/RepricingNavbar";
import {
  Bot,
  BarChart3,
  ShieldCheck,
  Zap,
  Box,
  Building2,
  Settings,
  User,
  LineChart,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Repricer",
    description: "Choose from several repricing strategies that optimize your prices automatically.",
    badge: null,
  },
  {
    icon: Building2,
    title: "Business Repricing",
    description: "Take advantage of repricing strategies created specifically for your marketplace.",
  },
  {
    icon: Settings,
    title: "Strategy Automation",
    description: "Use custom rules and filters to automatically adjust strategies as conditions change.",
    badge: "NEW",
  },
  {
    icon: Box,
    title: "Private Label Repricing",
    description: "Automatically adjust your prices to account for fluctuations in the market.",
  },
  {
    icon: Zap,
    title: "API + Integrations",
    description: "Spend less time on data entry and more time growing your business.",
  },
  {
    icon: ShieldCheck,
    title: "Profit Protection",
    description: "Advanced features that increase sales while also maximizing profit margins.",
  },
  {
    icon: LineChart,
    title: "Analytics + Reporting",
    description: "Track important metrics using graphs and charts to visualize profit and sales.",
  }
];

const solutions = [
  {
    icon: Box,
    title: "FBA Sellers",
    description: "Increase your sales, improve profit margins, and grow your business.",
  },
  {
    icon: BarChart3,
    title: "Online & Retail Arbitrage",
    description: "Win more Buy Boxes and beat your competition.",
  },
  {
    icon: User,
    title: "Private Label Brands",
    description: "Optimize your prices to maximize sales and profits.",
  },
  {
    icon: Sparkles,
    title: "Dropshippers",
    description: "Instantly react to your competition to maximize sales.",
  }
];

export default function RepricingLanding() {
  return (
    <div className="min-h-screen bg-background">
      <RepricingNavbar />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Intelligent Repricing Solution
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to dominate the competition
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/repricing">Open Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/repricing/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Product Features</h2>
          <p className="text-muted-foreground mt-2">
            Everything you need to dominate the competition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border/50 hover:border-border/100 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      {feature.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section className="container mx-auto px-4 py-16 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Solutions</h2>
          <p className="text-muted-foreground mt-2">
            Built for every seller and any industry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution) => (
            <Card key={solution.title} className="border border-border/50 hover:border-border/100 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit">
                    <solution.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}