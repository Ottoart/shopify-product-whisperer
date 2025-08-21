import { Store, Bell, Printer, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrintingSettings } from '@/components/shipping/PrintingSettings';
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Logs from '@/pages/Logs';

import { StoreManagementSettings } from '@/components/settings/StoreManagementSettings';

const Settings = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("store");

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your PrepFox application settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="printing">Printing</TabsTrigger>
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
                <StoreManagementSettings />
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