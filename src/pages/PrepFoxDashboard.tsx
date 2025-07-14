import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, DollarSign, Brain, CheckCircle, Users, Zap } from 'lucide-react';
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
              <Package className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                <p className="text-primary-foreground/80">Modules & Individual Subscriptions</p>
              </div>
            </div>
            <div className="text-right text-primary-foreground/90">
              <p className="text-sm">Today</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Individual Modules */}
        <section>
          <h2 className="text-2xl font-bold mb-6">📦 Individual Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shipping Automation Module */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>🚚 Shipping Automation Module</CardTitle>
                    <CardDescription>Inspired by ShipStation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-channel order aggregation</li>
                    <li>• Carrier integration (UPS, Canada Post, FedEx, etc.)</li>
                    <li>• Label creation, shipping presets, branded tracking pages</li>
                    <li>• Tracking updates, pickup requests</li>
                    <li>• Returns portal</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Pricing Tiers:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Starter</span>
                      <span className="text-sm">up to 100 orders, 1 user - <strong>$19/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Growth</span>
                      <span className="text-sm">500 orders, 3 users - <strong>$49/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Pro</span>
                      <span className="text-sm">2,000 orders, 10 users - <strong>$99/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Enterprise</span>
                      <span className="text-sm">Custom volume, 20+ users - <strong>Custom</strong></span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Add-ons: Extra users: $5/user | Branded returns portal: $10/month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Repricing Intelligence Module */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>💰 Repricing Intelligence Module</CardTitle>
                    <CardDescription>Inspired by Informed Repricer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Channel-specific pricing rules</li>
                    <li>• Competitor tracking</li>
                    <li>• Buy Box targeting</li>
                    <li>• Price elasticity testing</li>
                    <li>• AI recommendations</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Pricing (Based on SKUs):</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Starter</span>
                      <span className="text-sm">100 SKUs, 1 channel - <strong>$29/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Growth</span>
                      <span className="text-sm">1,000 SKUs, 3 channels - <strong>$59/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Pro</span>
                      <span className="text-sm">5,000 SKUs, 5 channels - <strong>$99/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Enterprise</span>
                      <span className="text-sm">Unlimited SKUs, 10 channels - <strong>Custom</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prep & Fulfillment */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>📦 Prep & Fulfillment</CardTitle>
                    <CardDescription>Inspired by AMZPrep</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Warehouse space (billed per cubic ft)</li>
                    <li>• Product prep services (FNSKU labeling, polybag, bundles)</li>
                    <li>• Direct-to-consumer shipping</li>
                    <li>• Returns handling</li>
                    <li>• Inventory sync with Amazon/Shopify/etc.</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Hybrid Pricing (Subscription + Per-Unit):</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Starter Hub</span>
                      <span className="text-sm">$49/mo + $1/cu ft storage</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Growth Hub</span>
                      <span className="text-sm">$99/mo + $0.75/cu ft (-10% services)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Pro Hub</span>
                      <span className="text-sm">$199/mo + $0.60/cu ft (-15% services)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Custom</span>
                      <span className="text-sm">Enterprise pricing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Product Optimization */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>🧠 AI Product Optimization Module</CardTitle>
                    <CardDescription>Inspired by Shopify Product Whisperer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI-generated product titles & descriptions</li>
                    <li>• SEO tags & structured metadata</li>
                    <li>• Duplicate detection + variation linking</li>
                    <li>• Bulk editor + auto-tagging</li>
                    <li>• Product scoring and suggestions</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Pricing (Products/Month):</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                      <span className="text-sm font-medium">Free Trial</span>
                      <span className="text-sm">20 products - <strong>$0</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Starter</span>
                      <span className="text-sm">100 products - <strong>$19/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Pro</span>
                      <span className="text-sm">500 products + bulk - <strong>$49/mo</strong></span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Unlimited</span>
                      <span className="text-sm">Unlimited products - <strong>$99/mo</strong></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Additional Services */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🧩 Additional Services</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <Zap className="h-6 w-6 text-primary mx-auto" />
                  <h4 className="font-medium">Branded Email Tracking</h4>
                  <p className="text-sm text-muted-foreground">$10/month/store</p>
                </div>
                <div className="text-center space-y-2">
                  <CheckCircle className="h-6 w-6 text-primary mx-auto" />
                  <h4 className="font-medium">Advanced Reporting</h4>
                  <p className="text-sm text-muted-foreground">$20/month</p>
                </div>
                <div className="text-center space-y-2">
                  <Users className="h-6 w-6 text-primary mx-auto" />
                  <h4 className="font-medium">Premium Support SLA</h4>
                  <p className="text-sm text-muted-foreground">$49/month</p>
                </div>
                <div className="text-center space-y-2">
                  <Package className="h-6 w-6 text-primary mx-auto" />
                  <h4 className="font-medium">Custom Domain/Branding</h4>
                  <p className="text-sm text-muted-foreground">$29/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bundling Strategy */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🎁 Bundle Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">15% Savings</Badge>
                  Essentials
                </CardTitle>
                <CardDescription>Shipping + AI Listing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$59<span className="text-sm font-normal">/month</span></div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">20% Savings</Badge>
                  Growth
                </CardTitle>
                <CardDescription>+ Repricer Module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$99<span className="text-sm font-normal">/month</span></div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">25% Savings</Badge>
                  Full Stack
                </CardTitle>
                <CardDescription>All Modules (incl. Prep)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$179<span className="text-sm font-normal">/month</span></div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4">
          <p className="text-muted-foreground">✅ Add individual services during onboarding | ✅ Upgrade/downgrade anytime</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Start Free Trial</Button>
            <Button variant="outline" size="lg">Contact Sales</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrepFoxDashboard;