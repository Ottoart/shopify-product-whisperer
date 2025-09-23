import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus,
  Trash2,
  Play,
  Save,
  Copy,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Condition {
  id: string;
  type: 'competitor_price' | 'inventory' | 'velocity' | 'time' | 'buybox';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: string;
  value2?: string;
}

interface Action {
  id: string;
  type: 'adjust_price' | 'set_price' | 'match_competitor' | 'round_price';
  adjustment_type: 'percentage' | 'fixed';
  value: string;
  min_price?: string;
  max_price?: string;
}

interface Rule {
  name: string;
  description: string;
  rule_type: 'competitive' | 'velocity' | 'inventory' | 'time' | 'manual';
  marketplaces: string[];
  conditions: Condition[];
  actions: Action[];
  is_active: boolean;
  priority: number;
}

const MARKETPLACES = ['Amazon', 'Walmart', 'eBay', 'Shopify', 'Etsy'];

export default function RuleBuilder() {
  const [rule, setRule] = useState<Rule>({
    name: '',
    description: '',
    rule_type: 'competitive',
    marketplaces: [],
    conditions: [],
    actions: [],
    is_active: true,
    priority: 1
  });
  const [previewProducts, setPreviewProducts] = useState<number>(0);
  const { toast } = useToast();

  const addCondition = () => {
    const newCondition: Condition = {
      id: crypto.randomUUID(),
      type: 'competitor_price',
      operator: 'less_than',
      value: ''
    };
    setRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition => 
        condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  };

  const removeCondition = (id: string) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  };

  const addAction = () => {
    const newAction: Action = {
      id: crypto.randomUUID(),
      type: 'adjust_price',
      adjustment_type: 'percentage',
      value: ''
    };
    setRule(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setRule(prev => ({
      ...prev,
      actions: prev.actions.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    }));
  };

  const removeAction = (id: string) => {
    setRule(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== id)
    }));
  };

  const saveRule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('repricing_rules')
        .insert({
          user_id: user.id,
          name: rule.name,
          description: rule.description,
          rule_type: rule.rule_type,
          marketplaces: rule.marketplaces,
          conditions: rule.conditions as any,
          actions: rule.actions as any,
          is_active: rule.is_active,
          priority: rule.priority
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rule saved successfully",
      });

      // Reset form
      setRule({
        name: '',
        description: '',
        rule_type: 'competitive',
        marketplaces: [],
        conditions: [],
        actions: [],
        is_active: true,
        priority: 1
      });
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: "Failed to save rule",
        variant: "destructive",
      });
    }
  };

  const testRule = async () => {
    // TODO: Implement rule testing logic
    setPreviewProducts(Math.floor(Math.random() * 50) + 10);
    toast({
      title: "Test Complete",
      description: `Rule would apply to ${previewProducts} products`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Repricing Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={rule.name}
                  onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Competitive Pricing for Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule_type">Rule Type</Label>
                <Select value={rule.rule_type} onValueChange={(value) => setRule(prev => ({ ...prev, rule_type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="velocity">Velocity-Based</SelectItem>
                    <SelectItem value="inventory">Inventory-Based</SelectItem>
                    <SelectItem value="time">Time-Based</SelectItem>
                    <SelectItem value="manual">Manual Override</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={rule.description}
                onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does..."
              />
            </div>

            <div className="space-y-2">
              <Label>Marketplaces</Label>
              <div className="flex flex-wrap gap-2">
                {MARKETPLACES.map((marketplace) => (
                  <div key={marketplace} className="flex items-center space-x-2">
                    <Checkbox
                      id={marketplace}
                      checked={rule.marketplaces.includes(marketplace)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRule(prev => ({ ...prev, marketplaces: [...prev.marketplaces, marketplace] }));
                        } else {
                          setRule(prev => ({ ...prev, marketplaces: prev.marketplaces.filter(m => m !== marketplace) }));
                        }
                      }}
                    />
                    <Label htmlFor={marketplace}>{marketplace}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Conditions</h3>
              <Button onClick={addCondition} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {rule.conditions.map((condition, index) => (
              <Card key={condition.id} className="p-4">
                <div className="flex items-center gap-4">
                  {index > 0 && <Badge variant="outline">AND</Badge>}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={condition.type} onValueChange={(value) => updateCondition(condition.id, { type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="competitor_price">Competitor Price</SelectItem>
                        <SelectItem value="inventory">Inventory Level</SelectItem>
                        <SelectItem value="velocity">Sales Velocity</SelectItem>
                        <SelectItem value="time">Time of Day</SelectItem>
                        <SelectItem value="buybox">Buy Box Status</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={condition.operator} onValueChange={(value) => updateCondition(condition.id, { operator: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="between">Between</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      placeholder="Value"
                    />

                    {condition.operator === 'between' && (
                      <Input
                        value={condition.value2 || ''}
                        onChange={(e) => updateCondition(condition.id, { value2: e.target.value })}
                        placeholder="Max Value"
                      />
                    )}
                  </div>
                  <Button
                    onClick={() => removeCondition(condition.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Actions</h3>
              <Button onClick={addAction} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>

            {rule.actions.map((action) => (
              <Card key={action.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={action.type} onValueChange={(value) => updateAction(action.id, { type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjust_price">Adjust Price</SelectItem>
                        <SelectItem value="set_price">Set Price</SelectItem>
                        <SelectItem value="match_competitor">Match Competitor</SelectItem>
                        <SelectItem value="round_price">Round Price</SelectItem>
                      </SelectContent>
                    </Select>

                    {action.type === 'adjust_price' && (
                      <Select value={action.adjustment_type} onValueChange={(value) => updateAction(action.id, { adjustment_type: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Input
                      value={action.value}
                      onChange={(e) => updateAction(action.id, { value: e.target.value })}
                      placeholder={action.adjustment_type === 'percentage' ? '% Change' : 'Amount'}
                    />
                  </div>
                  <Button
                    onClick={() => removeAction(action.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Preview and Actions */}
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Rule Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This rule will apply to approximately {previewProducts} products
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={saveRule} disabled={!rule.name}>
                <Save className="h-4 w-4 mr-2" />
                Save Rule
              </Button>
              <Button onClick={testRule} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test Rule
              </Button>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}