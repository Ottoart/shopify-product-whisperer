import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Settings, Save } from "lucide-react";

interface StoreConfiguration {
  id: string;
  store_name: string;
  platform: string;
  domain: string;
  access_token: string;
  is_active: boolean;
  created_at: string;
}

interface StoreSettingsProps {
  storeId: string;
  onBack: () => void;
}

export function StoreSettings({ storeId, onBack }: StoreSettingsProps) {
  const { toast } = useToast();
  const [store, setStore] = useState<StoreConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    store_name: "",
    status: "active",
    import_frequency: "automatic",
    standardize_addresses: true,
    standardize_international: true,
    residential_default: "commercial"
  });

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) throw error;
      
      setStore(data);
      setSettings(prev => ({
        ...prev,
        store_name: data.store_name,
        status: data.is_active ? "active" : "inactive"
      }));
    } catch (error: any) {
      toast({
        title: "Error fetching store",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_configurations')
        .update({
          store_name: settings.store_name,
          is_active: settings.status === "active"
        })
        .eq('id', storeId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Store settings have been updated successfully"
      });

      fetchStore();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading store settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p>Store not found</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span className="text-muted-foreground">Settings &gt;</span>
          <span className="font-medium">Store Setup</span>
        </div>
      </div>

      {/* Store Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{store.store_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{store.platform}</Badge>
            {store.is_active && <Badge variant="default">Active</Badge>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="tracking">Tracking Page</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="packing">Packing Slips</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Services</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value={settings.store_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                  className="max-w-md"
                />
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label>Status</Label>
                <RadioGroup
                  value={settings.status}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, status: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive">Inactive</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Inactive stores are hidden by default.
                </p>
              </div>

              {/* Import Frequency */}
              <div className="space-y-3">
                <Label>Import Frequency</Label>
                <RadioGroup
                  value={settings.import_frequency}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, import_frequency: value }))}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual Import</Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Imports order only when the refresh button is used.
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automatic" id="automatic" />
                      <Label htmlFor="automatic">Automatic Import</Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Imports orders periodically, based on demand, in the background.
                    </p>
                  </div>
                </RadioGroup>
              </div>

              {/* Address Standardization */}
              <div className="space-y-3">
                <Label>Standardize Addresses When Verified</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="standardize_us"
                      checked={settings.standardize_addresses}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, standardize_addresses: checked as boolean }))
                      }
                    />
                    <Label htmlFor="standardize_us" className="text-sm">
                      Standardize and correct US addresses
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="standardize_international"
                      checked={settings.standardize_international}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, standardize_international: checked as boolean }))
                      }
                    />
                    <Label htmlFor="standardize_international" className="text-sm">
                      Standardize and correct supported non-US addresses
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    International address verification supports: CA, GB, AU, DE, FR, NL, ES, SE, IL, and IT.
                  </p>
                </div>
              </div>

              {/* Residential/Commercial Indicator */}
              <div className="space-y-3">
                <Label>Residential/Commercial Indicator Default</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose the default value when address validation returns an unknown residential/commercial status.
                </p>
                <RadioGroup
                  value={settings.residential_default}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, residential_default: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="commercial" id="commercial" />
                    <Label htmlFor="commercial">Default to commercial if no value is returned</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residential" id="residential" />
                    <Label htmlFor="residential">Default to residential if no value is returned</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="marketplace" id="marketplace" />
                    <Label htmlFor="marketplace">Default to marketplace values if provided</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>Customize your store's branding and appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Branding settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Page Settings</CardTitle>
              <CardDescription>Configure tracking page preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tracking page settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Returns Settings</CardTitle>
              <CardDescription>Manage return policies and processes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Returns settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure automated email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Packing Slip Settings</CardTitle>
              <CardDescription>Customize packing slip templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Packing slip settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Settings</CardTitle>
              <CardDescription>Configure product management preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Product settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Services Settings</CardTitle>
              <CardDescription>Configure shipping service preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Shipping services settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}