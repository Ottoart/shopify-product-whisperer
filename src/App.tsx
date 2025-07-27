import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { StoreProvider } from "@/contexts/StoreContext";
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

import { CustomerTrackingPage as CustomerTracking } from "./pages/CustomerTracking";
import SendInventory from "./pages/SendInventory";
import ReceivingDashboard from "./pages/ReceivingDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import FulfillmentDashboard from "./pages/FulfillmentDashboard";
import PackingDashboard from "./pages/PackingDashboard";
import AuthPage from "./pages/AuthPage";
import CustomerPortal from "./pages/CustomerPortal";
import LandingPage from "./pages/LandingPage";
import ShippingLanding from "./pages/ShippingLanding";
import ShippingFeatures from "./pages/ShippingFeatures";
import ShippingPricing from "./pages/ShippingPricing";
import ShippingIntegrations from "./pages/ShippingIntegrations";
import ShippingResources from "./pages/ShippingResources";
import RepricingLanding from "./pages/RepricingLanding";
import RepricingFeatures from "./pages/RepricingFeatures";
import RepricingPricing from "./pages/RepricingPricing";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";

// Create query client outside component to prevent recreating
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route component that requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App layout for authenticated users
const AuthenticatedApp = () => {
  return (
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
              <Route path="/app" element={<Index />} />
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
              <Route path="/products" element={<Products />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/carriers" element={<Carriers />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/sync-status" element={<SyncStatus />} />
              <Route path="/logs" element={<Logs />} />
              
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Public routes (marketing site)
const PublicApp = () => {
  return (
    <main className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shipping-landing" element={<ShippingLanding />} />
        <Route path="/shipping-features" element={<ShippingFeatures />} />
        <Route path="/shipping-pricing" element={<ShippingPricing />} />
        <Route path="/shipping-integrations" element={<ShippingIntegrations />} />
        <Route path="/shipping-resources" element={<ShippingResources />} />
        <Route path="/repricing-landing" element={<RepricingLanding />} />
        <Route path="/repricing/features" element={<RepricingFeatures />} />
        <Route path="/repricing/pricing" element={<RepricingPricing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer-tracking" element={<CustomerTracking />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

const AppContent = () => {
  const session = useSession();

  return (
    <BrowserRouter>
      {session ? <AuthenticatedApp /> : <PublicApp />}
    </BrowserRouter>
  );
};

function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </SessionContextProvider>
      </QueryClientProvider>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App;