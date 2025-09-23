import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Play, Edit2, Trash2, AlertTriangle, CheckCircle } from "lucide-react";

interface ShippingRule {
  id: string;
  name: string;
  active: boolean;
  priority: number;
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  actions: {
    type: string;
    value: string;
  }[];
  applied: number;
  created: string;
}

export function ShippingRules() {
  const { toast } = useToast();
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [testingRule, setTestingRule] = useState<string | null>(null);

  // Mock rules data
  const [rules, setRules] = useState<ShippingRule[]>([
    {
      id: "1",
      name: "High Value Orders",
      active: true,
      priority: 1,
      conditions: [
        { field: "order_total", operator: "greater_than", value: "200" }
      ],
      actions: [
        { type: "carrier", value: "UPS Ground" },
        { type: "insurance", value: "true" },
        { type: "tag", value: "High Value" }
      ],
      applied: 47,
      created: "2024-01-10"
    },
    {
      id: "2",
      name: "Express SKU Items",
      active: true,
      priority: 2,
      conditions: [
        { field: "sku", operator: "contains", value: "XYZ123" }
      ],
      actions: [
        { type: "carrier", value: "FedEx Express" }
      ],
      applied: 12,
      created: "2024-01-12"
    },
    {
      id: "3",
      name: "International Orders",
      active: false,
      priority: 3,
      conditions: [
        { field: "shipping_country", operator: "not_equals", value: "US" }
      ],
      actions: [
        { type: "carrier", value: "FedEx International" },
        { type: "signature", value: "true" }
      ],
      applied: 0,
      created: "2024-01-15"
    }
  ]);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule?.active ? "📘 Rule deactivated" : "📘 Rule activated",
      description: `${rule?.name} has been ${rule?.active ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleTestRule = (ruleId: string) => {
    setTestingRule(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    
    toast({
      title: "🧪 Testing rule logic...",
      description: `Testing "${rule?.name}" against sample orders.`,
    });

    setTimeout(() => {
      setTestingRule(null);
      toast({
        title: "✅ Test completed!",
        description: "Rule would apply to 8 out of 25 sample orders.",
      });
    }, 2000);
  };

  const handleBulkApply = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    
    toast({
      title: "🚀 Bulk processing started!",
      description: `Applying "${rule?.name}" to existing orders. Let the robots do the work.`,
    });

    setTimeout(() => {
      toast({
        title: "🎯 Rule Applied!",
        description: "22 orders updated automatically.",
      });
    }, 3000);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule deleted",
      description: "The automation rule has been removed.",
    });
  };

  const renderConditions = (conditions: ShippingRule['conditions']) => {
    return conditions.map((condition, index) => (
      <div key={index} className="text-sm">
        <Badge variant="outline">
          {condition.field.replace('_', ' ')} {condition.operator.replace('_', ' ')} {condition.value}
        </Badge>
      </div>
    ));
  };

  const renderActions = (actions: ShippingRule['actions']) => {
    return actions.map((action, index) => (
      <div key={index} className="text-sm">
        <Badge variant="secondary">
          {action.type}: {action.value}
        </Badge>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Shipping Automation Rules
          </CardTitle>
          <CardDescription>
            Set it and forget it — so you don't have to touch every order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreatingRule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Rule
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={`transition-all ${rule.active ? 'border-green-200 bg-green-50/50' : 'border-muted'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={rule.active}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <Badge variant={rule.active ? "default" : "outline"}>
                      Priority {rule.priority}
                    </Badge>
                    {rule.active && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Conditions (IF)</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {renderConditions(rule.conditions)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Actions (THEN)</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {renderActions(rule.actions)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Applied to {rule.applied} orders</span>
                    <span>Created {rule.created}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestRule(rule.id)}
                    disabled={testingRule === rule.id}
                  >
                    {testingRule === rule.id ? (
                      <>
                        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-1"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Test
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkApply(rule.id)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal/Form */}
      {isCreatingRule && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create New Automation Rule</CardTitle>
            <CardDescription>
              Define conditions and actions for automatic order processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input 
                id="ruleName"
                placeholder="e.g., High Value International Orders"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conditions */}
              <div>
                <Label className="text-base font-medium">Conditions (IF)</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order_total">Order Total</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="sku">SKU</SelectItem>
                        <SelectItem value="shipping_country">Shipping Country</SelectItem>
                        <SelectItem value="tags">Tags</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input placeholder="Value" className="flex-1" />
                  </div>
                  
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div>
                <Label className="text-base font-medium">Actions (THEN)</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carrier">Set Carrier</SelectItem>
                        <SelectItem value="service">Set Service</SelectItem>
                        <SelectItem value="insurance">Add Insurance</SelectItem>
                        <SelectItem value="signature">Require Signature</SelectItem>
                        <SelectItem value="tag">Add Tag</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input placeholder="Value" className="flex-1" />
                  </div>
                  
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Action
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => {
                  setIsCreatingRule(false);
                  toast({
                    title: "📘 Your automation rule was saved.",
                    description: "Let the robots do the work.",
                  });
                }}
              >
                Save Rule
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCreatingRule(false)}
              >
                Cancel
              </Button>
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rule Conflicts Warning */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Rule Conflicts</h4>
              <p className="text-sm text-yellow-700">
                Some orders match multiple rules. Priority order determines which rule applies first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
