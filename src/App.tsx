import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import Index from "./pages/Index";
import MainDashboard from "./pages/MainDashboard";
import PrepFoxDashboard from "./pages/PrepFoxDashboard";
import MarketplaceGateway from "./pages/MarketplaceGateway";
import Shipping from "./pages/Shipping";
import ShippingOverview from "./pages/ShippingOverview";
import Carriers from "./pages/Carriers";
import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import BulkEditor from "./pages/BulkEditor";
import ShopifyIntegration from "./pages/ShopifyIntegration";
import Settings from "./pages/Settings";
import SyncStatus from "./pages/SyncStatus";
import Repricing from "./pages/Repricing";
import Strategies from "./pages/Strategies";
import Inventory from "./pages/Inventory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { AboutUs } from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

import Logs from "./pages/Logs";
import CanadaPostCallback from "./pages/CanadaPostCallback";
import { CustomerTrackingPage as CustomerTracking } from "./pages/CustomerTracking";
import SendInventory from "./pages/SendInventory";
import ReceivingDashboard from "./pages/ReceivingDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import FulfillmentDashboard from "./pages/FulfillmentDashboard";
import PackingDashboard from "./pages/PackingDashboard";
import AuthPage from "./pages/AuthPage";
import CustomerPortal from "./pages/CustomerPortal";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-12 flex items-center justify-between border-b bg-background px-4">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-lg font-semibold text-primary">PrepFox</h1>
              </div>
              <UserMenu />
            </header>
            
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<PrepFoxDashboard />} />
                
                <Route path="/marketplace-gateway" element={<MarketplaceGateway />} />
        <Route path="/send-inventory" element={<SendInventory />} />
        <Route path="/receiving" element={<ReceivingDashboard />} />
        <Route path="/inventory-management" element={<InventoryDashboard />} />
        <Route path="/fulfillment" element={<FulfillmentDashboard />} />
        <Route path="/packing" element={<PackingDashboard />} />
                <Route path="/shipping-overview" element={<ShippingOverview />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/bulk-editor" element={<BulkEditor />} />
                <Route path="/shopify-integration" element={<ShopifyIntegration />} />
                <Route path="/repricing" element={<Repricing />} />
                <Route path="/repricing-dashboard" element={<Repricing />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/carriers" element={<Carriers />} />
                <Route path="/sync-status" element={<SyncStatus />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/canada-post-oauth-callback" element={<CanadaPostCallback />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/customer-portal" element={<CustomerPortal />} />
                <Route path="/customer-tracking" element={<CustomerTracking />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;