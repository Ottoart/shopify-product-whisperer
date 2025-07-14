import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { DuplicateDetectionTool } from '@/components/inventory/DuplicateDetectionTool';
import { CrossMarketVariationLinking } from '@/components/inventory/CrossMarketVariationLinking';
import { Package, Copy, Link2 } from 'lucide-react';

export default function Inventory() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeBanner />
      
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      <Tabs defaultValue="duplicates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate Detection
          </TabsTrigger>
          <TabsTrigger value="variations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Variation Linking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="duplicates" className="space-y-6">
          <DuplicateDetectionTool />
        </TabsContent>

        <TabsContent value="variations" className="space-y-6">
          <CrossMarketVariationLinking />
        </TabsContent>
      </Tabs>
    </div>
  );
}