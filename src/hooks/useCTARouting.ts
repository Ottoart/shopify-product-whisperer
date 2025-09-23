import { useNavigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';

interface CTARoutingService {
  serviceType: string;
  route: string;
  requiresAuth: boolean;
  isQuoteRequest: boolean;
}

const SERVICE_ROUTING: CTARoutingService[] = [
  // Existing Services → Direct Integration
  {
    serviceType: 'fba-prep',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'amazon-sfp',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'fba-returns',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'dtc-fulfillment',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'ecommerce-fulfillment',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'b2b-fulfillment',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'omni-channel',
    route: '/fulfillment',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'subscription-fulfillment',
    route: '/inventory-management',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'shipping',
    route: '/shipping',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'storage',
    route: '/inventory-management',
    requiresAuth: true,
    isQuoteRequest: false
  },
  {
    serviceType: 'prep-software',
    route: '/dashboard',
    requiresAuth: true,
    isQuoteRequest: false
  },
  
  // Future Services → Quote Request
  {
    serviceType: 'international-freight',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'section-321',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'middle-mile-logistics',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'drip-feeding',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'wholesale-prep',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'global-marketplaces',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  },
  {
    serviceType: 'market-expansion',
    route: '/fulfillment/quote',
    requiresAuth: false,
    isQuoteRequest: true
  }
];

export const useCTARouting = () => {
  const navigate = useNavigate();
  const session = useSession();

  const routeToService = (serviceType: string, additionalParams?: Record<string, string>) => {
    const serviceConfig = SERVICE_ROUTING.find(s => s.serviceType === serviceType);
    
    if (!serviceConfig) {
      console.warn(`No routing configuration found for service: ${serviceType}`);
      // Default to quote form for unknown services
      navigate('/fulfillment/quote?service=' + serviceType);
      return;
    }

    // Check if authentication is required
    if (serviceConfig.requiresAuth && !session) {
      // Store intended destination and redirect to auth
      sessionStorage.setItem('redirectAfterAuth', serviceConfig.route);
      if (additionalParams) {
        sessionStorage.setItem('redirectParams', JSON.stringify(additionalParams));
      }
      navigate('/auth');
      return;
    }

    // Build route with parameters
    let targetRoute = serviceConfig.route;
    const params = new URLSearchParams();
    
    // Add service type for quote requests
    if (serviceConfig.isQuoteRequest) {
      params.set('service', serviceType);
    }
    
    // Add any additional parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    
    // Append query parameters if any exist
    if (params.toString()) {
      targetRoute += '?' + params.toString();
    }
    
    navigate(targetRoute);
  };

  const getServiceDestination = (serviceType: string): 'dashboard' | 'quote' | 'auth' => {
    const serviceConfig = SERVICE_ROUTING.find(s => s.serviceType === serviceType);
    
    if (!serviceConfig) {
      return 'quote';
    }
    
    if (serviceConfig.requiresAuth && !session) {
      return 'auth';
    }
    
    return serviceConfig.isQuoteRequest ? 'quote' : 'dashboard';
  };

  const getServiceCTAText = (serviceType: string): string => {
    const destination = getServiceDestination(serviceType);
    
    switch (destination) {
      case 'dashboard':
        return 'Get Started';
      case 'quote':
        return 'Get Quote';
      case 'auth':
        return 'Sign Up to Start';
      default:
        return 'Learn More';
    }
  };

  const getSecondaryServiceCTAText = (serviceType: string): string => {
    const destination = getServiceDestination(serviceType);
    
    switch (destination) {
      case 'dashboard':
        return 'Contact Sales';
      case 'quote':
        return 'Schedule Consultation';
      case 'auth':
        return 'Learn More';
      default:
        return 'Contact Us';
    }
  };

  return {
    routeToService,
    getServiceDestination,
    getServiceCTAText,
    getSecondaryServiceCTAText
  };
};

// Helper hook for determining button variants based on service type
export const useServiceCTAVariants = (serviceType: string) => {
  const { getServiceDestination } = useCTARouting();
  const destination = getServiceDestination(serviceType);
  
  return {
    primaryVariant: 'default' as const,
    secondaryVariant: 'outline' as const,
    primaryIcon: destination === 'quote' ? 'calculator' : 'arrow-right',
    secondaryIcon: destination === 'quote' ? 'calendar' : 'phone'
  };
};
