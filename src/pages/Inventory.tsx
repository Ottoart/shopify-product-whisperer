import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DuplicateDetectionTool } from '@/components/inventory/DuplicateDetectionTool';
import { CrossMarketVariationLinking } from '@/components/inventory/CrossMarketVariationLinking';
import { Package, Copy, Link2, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Inventory() {
  const { user } = useAuth();
  
  // Extract display name from user metadata or use email
  const displayName = user?.user_metadata?.display_name || 
                     user?.email?.split('@')[0] || 
                     'there';

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Custom Inventory Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-lg font-medium text-foreground">
                Hi {displayName}, welcome to Inventory Management! 👋
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              This dashboard helps you simplify your Shopify store management:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Detect and merge duplicate listings</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Link all product variants (sizes, bundles, multipacks)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Centralize inventory to prevent overselling</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Make your catalog cleaner, reduce overselling risks, and save hours of manual work.
            </p>
          </div>
        </Card>
        
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Package className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage and optimize your product catalog efficiently</p>
            </TooltipContent>
          </Tooltip>
        </div>

      <Tabs defaultValue="duplicates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate Detection
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Find and merge duplicate product listings</p>
              </TooltipContent>
            </Tooltip>
          </TabsTrigger>
          <TabsTrigger value="variations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Variation Linking
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Link all sizes, colors, or formats of a product under a single master listing to simplify stock updates</p>
              </TooltipContent>
            </Tooltip>
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
    </TooltipProvider>
  );
}