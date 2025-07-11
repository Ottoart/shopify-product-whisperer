import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import MainDashboard from "./pages/MainDashboard";
import PrepFoxDashboard from "./pages/PrepFoxDashboard";
import MarketplaceGateway from "./pages/MarketplaceGateway";
import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import BulkEditor from "./pages/BulkEditor";
import ShopifyIntegration from "./pages/ShopifyIntegration";
import Settings from "./pages/Settings";
import SyncStatus from "./pages/SyncStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                {/* Global header with sidebar trigger */}
                <header className="h-12 flex items-center border-b bg-background px-4">
                  <SidebarTrigger className="mr-4" />
                  <h1 className="text-lg font-semibold text-primary">PrepFox</h1>
                </header>
                
                {/* Main content area */}
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/ai-dashboard" element={<PrepFoxDashboard />} />
                    <Route path="/marketplace-gateway" element={<MarketplaceGateway />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/activity" element={<Activity />} />
                    <Route path="/bulk-editor" element={<BulkEditor />} />
                    <Route path="/shopify-integration" element={<ShopifyIntegration />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/sync-status" element={<SyncStatus />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;
