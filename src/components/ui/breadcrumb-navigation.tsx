import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ 
  items: customItems, 
  className = "" 
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert path segments to readable labels
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Custom label mappings for specific paths
      const labelMappings: Record<string, string> = {
        'fulfillment': 'Fulfillment',
        'services': 'Services',
        'products': 'Products',
        'fba-prep': 'FBA Prep',
        'amazon-sfp': 'Amazon SFP',
        'amazon-fba-returns': 'FBA Returns',
        'dtc-fulfillment': 'DTC Fulfillment',
        'ecommerce-fulfillment': 'eCommerce Fulfillment',
        'b2b-fulfillment': 'B2B Fulfillment',
        'omni-channel-3pl': 'Omni-Channel 3PL',
        'international-freight': 'International Freight',
        'subscription-fulfillment': 'Subscription Fulfillment',
        'prep-software': 'Prep Software',
        'middle-mile-logistics': 'Middle Mile Logistics',
        'section-321': 'Section 321',
        'drip-feeding': 'Drip Feeding',
        'wholesale-prep': 'Wholesale Prep',
        'global-marketplaces': 'Global Marketplaces',
        'market-expansion': 'Market Expansion',
        'pricing-detailed': 'Detailed Pricing'
      };
      
      if (labelMappings[segment]) {
        label = labelMappings[segment];
      }
      
      // Don't link to the current page (last item)
      const href = index === pathSegments.length - 1 ? undefined : currentPath;
      
      breadcrumbs.push({ label, href });
    });
    
    return breadcrumbs;
  };
  
  const items = customItems || generateBreadcrumbs();
  
  if (items.length <= 1) return null; // Don't show breadcrumbs for root or single-level pages
  
  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            )}
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors duration-200 hover:underline"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;