import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCTARouting, useServiceCTAVariants } from '@/hooks/useCTARouting';
import { 
  ArrowRight, 
  Calculator, 
  Calendar, 
  Phone,
  UserPlus,
  MessageSquare
} from 'lucide-react';

interface SmartCTAButtonProps {
  serviceType: string;
  size?: 'sm' | 'lg' | 'default';
  className?: string;
  variant?: 'primary' | 'secondary';
  additionalParams?: Record<string, string>;
  children?: React.ReactNode;
}

const getIcon = (iconType: string, size: number = 16) => {
  const iconMap = {
    'arrow-right': ArrowRight,
    'calculator': Calculator,
    'calendar': Calendar,
    'phone': Phone,
    'user-plus': UserPlus,
    'message-square': MessageSquare
  };
  
  const IconComponent = iconMap[iconType as keyof typeof iconMap] || ArrowRight;
  return <IconComponent className={`h-${size === 16 ? '4' : '5'} w-${size === 16 ? '4' : '5'}`} />;
};

export const SmartCTAButton: React.FC<SmartCTAButtonProps> = ({
  serviceType,
  size = 'default',
  className = '',
  variant = 'primary',
  additionalParams,
  children
}) => {
  const { routeToService, getServiceCTAText, getSecondaryServiceCTAText } = useCTARouting();
  const { primaryVariant, secondaryVariant, primaryIcon, secondaryIcon } = useServiceCTAVariants(serviceType);
  
  const handleClick = () => {
    routeToService(serviceType, additionalParams);
  };

  const buttonText = variant === 'primary' 
    ? getServiceCTAText(serviceType) 
    : getSecondaryServiceCTAText(serviceType);
    
  const buttonVariant = variant === 'primary' ? 'default' : 'outline';
  const icon = variant === 'primary' ? primaryIcon : secondaryIcon;
  const iconSize = size === 'lg' ? 20 : 16;

  return (
    <Button
      onClick={handleClick}
      variant={buttonVariant}
      size={size}
      className={`${className} transition-all duration-200`}
    >
      {children || buttonText}
      {getIcon(icon, iconSize)}
    </Button>
  );
};

interface SmartCTALinkProps {
  serviceType: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  additionalParams?: Record<string, string>;
  children?: React.ReactNode;
}

export const SmartCTALink: React.FC<SmartCTALinkProps> = ({
  serviceType,
  className = '',
  variant = 'primary',
  additionalParams,
  children
}) => {
  const { getServiceCTAText, getSecondaryServiceCTAText } = useCTARouting();
  
  // Build the route with parameters
  const baseRoute = variant === 'primary' ? '/fulfillment/quote' : '/fulfillment/quote';
  const params = new URLSearchParams();
  params.set('service', serviceType);
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value);
    });
  }
  
  const route = `${baseRoute}?${params.toString()}`;
  
  const linkText = variant === 'primary' 
    ? getServiceCTAText(serviceType) 
    : getSecondaryServiceCTAText(serviceType);

  return (
    <Link 
      to={route}
      className={`inline-flex items-center space-x-2 hover:underline transition-colors duration-200 ${className}`}
    >
      <span>{children || linkText}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
};

// Component for dual CTA sections (common pattern)
interface SmartCTASectionProps {
  serviceType: string;
  title?: string;
  description?: string;
  className?: string;
  additionalParams?: Record<string, string>;
}

export const SmartCTASection: React.FC<SmartCTASectionProps> = ({
  serviceType,
  title,
  description,
  className = '',
  additionalParams
}) => {
  return (
    <section className={`py-16 px-4 bg-primary/5 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xl text-muted-foreground mb-8">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SmartCTAButton 
            serviceType={serviceType}
            variant="primary"
            size="lg"
            className="text-lg px-8"
            additionalParams={additionalParams}
          />
          <SmartCTAButton 
            serviceType={serviceType}
            variant="secondary"
            size="lg"
            className="text-lg px-8"
            additionalParams={additionalParams}
          />
        </div>
      </div>
    </section>
  );
};

export default SmartCTAButton;