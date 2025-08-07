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
import MainLayout from "@/components/MainLayout";
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
import Store from "./pages/Store";
import StoreCategory from "./pages/StoreCategory";
import FulfillmentLanding from "./pages/FulfillmentLanding";
import FulfillmentFeatures from "./pages/FulfillmentFeatures";
import FulfillmentPricing from "./pages/FulfillmentPricing";
import ProductManagementLanding from "./pages/ProductManagementLanding";
import ProductManagementFeatures from "./pages/ProductManagementFeatures";
import ProductManagementPricing from "./pages/ProductManagementPricing";
import FBAPrep from "./pages/fulfillment/FBAPrep";
import AmazonSFP from "./pages/fulfillment/AmazonSFP";
import FBAReturns from "./pages/fulfillment/FBAReturns";
import DTCFulfillment from "./pages/fulfillment/DTCFulfillment";
import EcommerceFulfillment from "./pages/fulfillment/EcommerceFulfillment";
import B2BFulfillment from "./pages/fulfillment/B2BFulfillment";
import OmniChannelFulfillment from "./pages/fulfillment/OmniChannelFulfillment";
import InternationalFreight from "./pages/fulfillment/InternationalFreight";
import SubscriptionFulfillment from "./pages/fulfillment/SubscriptionFulfillment";

// Phase 2A - Software & Technology Products
import PrepSoftware from "./pages/fulfillment/PrepSoftware";
import MiddleMileLogistics from "./pages/fulfillment/MiddleMileLogistics";
import Section321 from "./pages/fulfillment/Section321";

// Phase 2B - Strategic Services
import DripFeeding from "./pages/fulfillment/DripFeeding";
import WholesalePrep from "./pages/fulfillment/WholesalePrep";
import GlobalMarketplaces from "./pages/fulfillment/GlobalMarketplaces";
import MarketExpansion from "./pages/fulfillment/MarketExpansion";

// Phase 3A - Comprehensive Pricing
import FulfillmentPricingDetailed from "./pages/FulfillmentPricingDetailed";

// Phase 4A - Quote System
import FulfillmentQuote from "./pages/FulfillmentQuote";
import FulfillmentQuoteSuccess from "./pages/FulfillmentQuoteSuccess";

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
    <MainLayout>
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
        <Route path="/fulfillment-landing" element={<FulfillmentLanding />} />
        <Route path="/fulfillment/features" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/pricing" element={<FulfillmentPricing />} />
        <Route path="/fulfillment/pricing-detailed" element={<FulfillmentPricingDetailed />} />
        <Route path="/fulfillment-pricing" element={<FulfillmentPricing />} />
        <Route path="/fulfillment/services/fba-prep" element={<FBAPrep />} />
        <Route path="/fulfillment/services/amazon-sfp" element={<AmazonSFP />} />
        <Route path="/fulfillment/services/amazon-fba-returns" element={<FBAReturns />} />
        <Route path="/fulfillment/services/dtc-fulfillment" element={<DTCFulfillment />} />
        <Route path="/fulfillment/services/ecommerce-fulfillment" element={<EcommerceFulfillment />} />
        <Route path="/fulfillment/services/b2b-fulfillment" element={<B2BFulfillment />} />
        <Route path="/fulfillment/services/omni-channel-3pl" element={<OmniChannelFulfillment />} />
        <Route path="/fulfillment/services/international-freight" element={<InternationalFreight />} />
        <Route path="/fulfillment/services/subscription-fulfillment" element={<SubscriptionFulfillment />} />
        
        {/* Phase 2A - Software & Technology Products */}
        <Route path="/fulfillment/products/prep-software" element={<PrepSoftware />} />
        <Route path="/fulfillment/products/middle-mile-logistics" element={<MiddleMileLogistics />} />
        <Route path="/fulfillment/products/section-321" element={<Section321 />} />
        
        {/* Phase 2B - Strategic Services */}
        <Route path="/fulfillment/products/drip-feeding" element={<DripFeeding />} />
        <Route path="/fulfillment/products/wholesale-prep" element={<WholesalePrep />} />
        <Route path="/fulfillment/products/global-marketplaces" element={<GlobalMarketplaces />} />
        <Route path="/fulfillment/products/market-expansion" element={<MarketExpansion />} />
        
        {/* Phase 4A - Quote System */}
        <Route path="/fulfillment/quote" element={<FulfillmentQuote />} />
        <Route path="/fulfillment/quote-success" element={<FulfillmentQuoteSuccess />} />
        <Route path="/fulfillment/services/receiving" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/services/storage" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/services/pick-pack" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/services/shipping" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/solutions/fba-prep" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/solutions/3pl" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/solutions/dropshipping" element={<FulfillmentFeatures />} />
        <Route path="/fulfillment/solutions/private-label" element={<FulfillmentFeatures />} />
        <Route path="/product-management-landing" element={<ProductManagementLanding />} />
        <Route path="/product-management/features" element={<ProductManagementFeatures />} />
        <Route path="/product-management/pricing" element={<ProductManagementPricing />} />
        <Route path="/product-management-pricing" element={<ProductManagementPricing />} />
        <Route path="/product-management/features/ai-optimization" element={<ProductManagementFeatures />} />
        <Route path="/product-management/features/bulk-editing" element={<ProductManagementFeatures />} />
        <Route path="/product-management/features/multi-channel-sync" element={<ProductManagementFeatures />} />
        <Route path="/product-management/features/analytics" element={<ProductManagementFeatures />} />
        <Route path="/product-management/solutions/ecommerce" element={<ProductManagementFeatures />} />
        <Route path="/product-management/solutions/amazon-fba" element={<ProductManagementFeatures />} />
        <Route path="/product-management/solutions/marketplace" element={<ProductManagementFeatures />} />
        <Route path="/product-management/solutions/enterprise" element={<ProductManagementFeatures />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer-tracking" element={<CustomerTracking />} />
        <Route path="/store" element={<Store />} />
        <Route path="/store/:categorySlug" element={<StoreCategory />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
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