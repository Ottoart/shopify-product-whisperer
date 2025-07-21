import { useState } from 'react';
import { Settings as SettingsIcon, Store, Key, Database, Bell, Printer, FileText, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreConfig } from '@/components/StoreConfig';
import { PrintingSettings } from '@/components/shipping/PrintingSettings';
import { CarrierManagement } from '@/components/shipping/CarrierManagement';
import { CarrierConfigurationDialog } from '@/components/shipping/CarrierConfigurationDialog';
import { CarrierCredentialValidator } from '@/components/shipping/CarrierCredentialValidator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Logs from '@/pages/Logs';

const Settings = () => {
  const [isCarrierDialogOpen, setIsCarrierDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your PrepFox application</p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="carriers">Carriers</TabsTrigger>
            <TabsTrigger value="printing">Printing</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Configuration Hub
                </CardTitle>
                <CardDescription>
                  Add and modify your store configurations in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StoreConfig />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carriers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Shipping Carriers
                </CardTitle>
                <CardDescription>
                  Configure and manage your shipping carrier integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Add Carrier Button */}
                  <div className="flex justify-start">
                    <Button onClick={() => setIsCarrierDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure New Carrier
                    </Button>
                  </div>
                  
                  {/* Carrier Configuration Dialog */}
                  <CarrierConfigurationDialog 
                    isOpen={isCarrierDialogOpen} 
                    onClose={() => setIsCarrierDialogOpen(false)} 
                  />

                  {/* Carrier Management */}
                  <CarrierManagement />

                  {/* Carrier Credential Validator */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Carrier Validation</h3>
                    <CarrierCredentialValidator />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Printing Configuration
                </CardTitle>
                <CardDescription>
                  Configure label formats, printers, and document routing like ShipStation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrintingSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys & Authentication
                </CardTitle>
                <CardDescription>
                  Manage your API keys and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">OpenAI Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      For AI-powered product optimization (configured in Supabase)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sync Settings
                </CardTitle>
                <CardDescription>
                  Configure how products are synchronized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto Sync</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync products on a schedule
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Coming Soon</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Batch Size</h4>
                      <p className="text-sm text-muted-foreground">
                        Number of products to sync per batch (currently: 250)
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Optimized</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Conflict Resolution</h4>
                      <p className="text-sm text-muted-foreground">
                        How to handle conflicts between local and Shopify data
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Shopify Wins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sync Completion</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when product sync completes
                      </p>
                    </div>
                    <span className="text-sm text-success">Enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sync Errors</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when sync errors occur
                      </p>
                    </div>
                    <span className="text-sm text-success">Enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Bulk Edit Completion</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when bulk edits complete
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Coming Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Logs
                </CardTitle>
                <CardDescription>
                  View application logs, activities, and error reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Logs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;