import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Target, TrendingUp, DollarSign, Users, Edit, Copy, Trash2, Settings, Zap, Brain } from "lucide-react";

const strategies = [
  {
    id: 1,
    name: "Aggressive Buy Box",
    type: "Get the Buy Box",
    assignedListings: 156,
    grossSales: 45200,
    margin: 28.5,
    buyBoxPercent: 92,
    profit: 12894,
    liveListings: 142,
    missingCosts: 3
  },
  {
    id: 2,
    name: "Premium Profit",
    type: "Optimal Price",
    assignedListings: 89,
    grossSales: 32100,
    margin: 35.2,
    buyBoxPercent: 78,
    profit: 11299,
    liveListings: 84,
    missingCosts: 1
  },
  {
    id: 3,
    name: "Brand Protection",
    type: "Private Label",
    assignedListings: 34,
    grossSales: 18900,
    margin: 42.1,
    buyBoxPercent: 95,
    profit: 7957,
    liveListings: 34,
    missingCosts: 0
  }
];

export default function Strategies() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyData, setStrategyData] = useState({
    name: "",
    type: "",
    settings: {},
    pricing: {}
  });

  const strategyTypes = [
    { value: "buy-box", label: "Get the Buy Box", description: "Optimize for Buy Box ownership" },
    { value: "optimal-price", label: "Optimal Price", description: "Balance profit and competitiveness" },
    { value: "private-label", label: "Private Label", description: "Protect brand pricing" },
    { value: "featured-merchants", label: "Compete with Featured Merchants", description: "Match featured seller prices" },
    { value: "lowest-price", label: "Compete with Lowest Price", description: "Stay competitive with lowest offers" },
    { value: "custom", label: "Build Your Own", description: "Create custom repricing logic" }
  ];

  const renderCreateStrategyContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategy-name">Strategy Name</Label>
              <Input
                id="strategy-name"
                placeholder="Enter strategy name..."
                value={strategyData.name}
                onChange={(e) => setStrategyData({...strategyData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Strategy Type</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {strategyTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      strategyData.type === type.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setStrategyData({...strategyData, type: type.value})}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Strategy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Smart Price Reset</Label>
                  <p className="text-sm text-muted-foreground">Automatically reset prices when no competition</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Prioritize FBA over MFN</Label>
                  <p className="text-sm text-muted-foreground">Give preference to Fulfillment by Amazon</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Amazon Business Pricing</Label>
                  <p className="text-sm text-muted-foreground">Enable B2B pricing strategies</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Min/Max Price Settings</h3>
            <div>
              <Label>Pricing Logic</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose pricing logic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roi">Return on Investment (ROI)</SelectItem>
                  <SelectItem value="margin">Profit Margin</SelectItem>
                  <SelectItem value="fixed">Fixed Profit</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Price</Label>
                <Input placeholder="$0.00" />
              </div>
              <div>
                <Label>Maximum Price</Label>
                <Input placeholder="$0.00" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Review & Confirm</h3>
            <div className="space-y-3">
              <div>
                <Label>Strategy Name</Label>
                <p className="text-sm">{strategyData.name || "Unnamed Strategy"}</p>
              </div>
              <div>
                <Label>Strategy Type</Label>
                <p className="text-sm">
                  {strategyTypes.find(t => t.value === strategyData.type)?.label || "Not selected"}
                </p>
              </div>
              <div>
                <Label>Settings Configured</Label>
                <p className="text-sm text-muted-foreground">Smart pricing and competition rules applied</p>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">AI Recommendation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your settings, consider enabling Smart Price Reset for better performance during low competition periods.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repricing Strategies</h1>
          <p className="text-muted-foreground">
            Create, manage, and optimize your repricing strategies
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Strategy</DialogTitle>
              <DialogDescription>
                Step {currentStep} of 4: Configure your repricing strategy
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep ? 'bg-primary text-primary-foreground' :
                      step < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && <div className="w-8 h-0.5 bg-muted mx-2" />}
                  </div>
                ))}
              </div>
            </div>

            {renderCreateStrategyContent()}

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={() => {
                    setShowCreateDialog(false);
                    setCurrentStep(1);
                  }}>
                    Create Strategy
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <CardDescription>{strategy.type}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Assigned Listings</div>
                  <div className="font-medium">{strategy.assignedListings}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Live Listings</div>
                  <div className="font-medium">{strategy.liveListings}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gross Sales (30d)</div>
                  <div className="font-medium">${strategy.grossSales.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Profit</div>
                  <div className="font-medium">${strategy.profit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Margin</div>
                  <div className="font-medium">{strategy.margin}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Buy Box %</div>
                  <div className="font-medium">{strategy.buyBoxPercent}%</div>
                </div>
              </div>

              {strategy.missingCosts > 0 && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <span className="text-yellow-800">{strategy.missingCosts} listings missing costs</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm text-blue-800">Simulate Strategy</span>
                  </div>
                  <p className="text-xs text-blue-700">Test performance on selected SKUs</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm text-green-800">AI Insight</span>
                  </div>
                  <p className="text-xs text-green-700">Consider adjusting min price for better margins</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}