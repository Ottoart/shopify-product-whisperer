import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save,
  Upload,
  Download,
  Settings,
  AlertCircle,
  Users,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RepricingSettings() {
  const [globalSettings, setGlobalSettings] = useState({
    defaultProfitMargin: 15,
    currency: 'USD',
    timezone: 'America/New_York',
    logRetentionDays: 30,
    includeTax: true,
    includeShipping: false,
    autoRepricing: true,
    alertThresholds: {
      marginWarning: 5,
      buyBoxLoss: true,
      priceDeviation: 10
    }
  });

  const [notifications, setNotifications] = useState({
    email: true,
    dashboard: true,
    lowMargin: true,
    buyBoxLoss: true,
    ruleConflicts: true,
    dailySummary: false
  });

  const { toast } = useToast();

  const saveSettings = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, this would process the CSV file
      toast({
        title: "Success",
        description: `Uploaded ${file.name} successfully`,
      });
    }
  };

  const downloadTemplate = () => {
    // In a real implementation, this would generate and download a CSV template
    const csvContent = "SKU,Min Price,Max Price,Rule Name\nEXAMPLE-001,10.00,50.00,Competitive Pricing\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Repricing Settings</h2>
        <p className="text-muted-foreground">Configure global settings and preferences</p>
      </div>

      {/* Global Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profitMargin">Default Profit Margin (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  value={globalSettings.defaultProfitMargin}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    defaultProfitMargin: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={globalSettings.currency} onValueChange={(value) => 
                  setGlobalSettings(prev => ({ ...prev, currency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={globalSettings.timezone} onValueChange={(value) => 
                  setGlobalSettings(prev => ({ ...prev, timezone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logRetention">Log Retention (days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  value={globalSettings.logRetentionDays}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    logRetentionDays: parseInt(e.target.value) || 30
                  }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeTax">Include Tax in Pricing</Label>
                  <Switch
                    id="includeTax"
                    checked={globalSettings.includeTax}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({
                      ...prev,
                      includeTax: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeShipping">Include Shipping in Pricing</Label>
                  <Switch
                    id="includeShipping"
                    checked={globalSettings.includeShipping}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({
                      ...prev,
                      includeShipping: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoRepricing">Enable Auto-Repricing</Label>
                  <Switch
                    id="autoRepricing"
                    checked={globalSettings.autoRepricing}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({
                      ...prev,
                      autoRepricing: checked
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marginWarning">Margin Warning Threshold (%)</Label>
                <Input
                  id="marginWarning"
                  type="number"
                  value={globalSettings.alertThresholds.marginWarning}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    alertThresholds: {
                      ...prev.alertThresholds,
                      marginWarning: parseInt(e.target.value) || 0
                    }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceDeviation">Price Deviation Alert (%)</Label>
                <Input
                  id="priceDeviation"
                  type="number"
                  value={globalSettings.alertThresholds.priceDeviation}
                  onChange={(e) => setGlobalSettings(prev => ({
                    ...prev,
                    alertThresholds: {
                      ...prev.alertThresholds,
                      priceDeviation: parseInt(e.target.value) || 0
                    }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="buyBoxAlert">Buy Box Loss Alert</Label>
                <Switch
                  id="buyBoxAlert"
                  checked={globalSettings.alertThresholds.buyBoxLoss}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({
                    ...prev,
                    alertThresholds: {
                      ...prev.alertThresholds,
                      buyBoxLoss: checked
                    }
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notification Channels</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifs">Email Notifications</Label>
                <Switch
                  id="emailNotifs"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    email: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dashboardNotifs">Dashboard Notifications</Label>
                <Switch
                  id="dashboardNotifs"
                  checked={notifications.dashboard}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    dashboard: checked
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Alert Types</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="lowMarginNotif">Low Margin Alerts</Label>
                <Switch
                  id="lowMarginNotif"
                  checked={notifications.lowMargin}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    lowMargin: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="buyBoxNotif">Buy Box Loss Alerts</Label>
                <Switch
                  id="buyBoxNotif"
                  checked={notifications.buyBoxLoss}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    buyBoxLoss: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="conflictNotif">Rule Conflict Alerts</Label>
                <Switch
                  id="conflictNotif"
                  checked={notifications.ruleConflicts}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    ruleConflicts: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dailySummaryNotif">Daily Summary</Label>
                <Switch
                  id="dailySummaryNotif"
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) => setNotifications(prev => ({
                    ...prev,
                    dailySummary: checked
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import/Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Import Pricing Data (CSV)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-auto"
                />
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Upload a CSV file with columns: SKU, Min Price, Max Price, Rule Name
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Current Prices
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Active Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}