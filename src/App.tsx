import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import MainDashboard from "./pages/MainDashboard";
import PrepFoxDashboard from "./pages/PrepFoxDashboard";
import MarketplaceGateway from "./pages/MarketplaceGateway";
import Shipping from "./pages/Shipping";
import ShippingOverview from "./pages/ShippingOverview";
import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import BulkEditor from "./pages/BulkEditor";
import ShopifyIntegration from "./pages/ShopifyIntegration";
import Settings from "./pages/Settings";
import SyncStatus from "./pages/SyncStatus";
import Repricing from "./pages/Repricing";
import Inventory from "./pages/Inventory";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {/* Global header with sidebar trigger and user menu */}
            <header className="h-12 flex items-center justify-between border-b bg-background px-4">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <h1 className="text-lg font-semibold text-primary">PrepFox</h1>
              </div>
              <UserMenu />
            </header>
            
            {/* Main content area */}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><PrepFoxDashboard /></ProtectedRoute>} />
                <Route path="/ai-dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
                <Route path="/marketplace-gateway" element={<ProtectedRoute><MarketplaceGateway /></ProtectedRoute>} />
                <Route path="/shipping-overview" element={<ProtectedRoute><ShippingOverview /></ProtectedRoute>} />
                <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
                <Route path="/bulk-editor" element={<ProtectedRoute><BulkEditor /></ProtectedRoute>} />
                <Route path="/shopify-integration" element={<ProtectedRoute><ShopifyIntegration /></ProtectedRoute>} />
                <Route path="/repricing" element={<ProtectedRoute><Repricing /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/sync-status" element={<ProtectedRoute><SyncStatus /></ProtectedRoute>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
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
