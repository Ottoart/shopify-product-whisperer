import { useState } from "react";
import { AlertTriangle, RefreshCw, ExternalLink, Phone, MapPin, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShippingError {
  code: string;
  message: string;
  details?: any;
  carrier?: string;
  field?: string;
  suggestions?: string[];
}

interface ShippingErrorHandlerProps {
  error: ShippingError | null;
  onRetry?: () => void;
  onClearError?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function ShippingErrorHandler({
  error,
  onRetry,
  onClearError,
  retryCount = 0,
  maxRetries = 3
}: ShippingErrorHandlerProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const getErrorIcon = (code: string) => {
    switch (true) {
      case code.includes('PHONE'):
        return <Phone className="h-4 w-4" />;
      case code.includes('ADDRESS'):
        return <MapPin className="h-4 w-4" />;
      case code.includes('PACKAGE'):
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorSeverity = (code: string): "default" | "destructive" => {
    const critical = ['UPS_AUTH_FAILED', 'MISSING_AUTH', 'INVALID_AUTH', 'UPS_TOKEN_EXPIRED'];
    return critical.includes(code) ? "destructive" : "default";
  };

  const getErrorSolutions = (error: ShippingError): string[] => {
    const solutions: string[] = [];

    switch (error.code) {
      case 'UPS_AUTH_FAILED':
      case 'UPS_TOKEN_EXPIRED':
        solutions.push('Reconnect your UPS account in carrier settings');
        solutions.push('Verify your UPS account credentials');
        solutions.push('Check if your UPS account has shipping permissions');
        break;
      
      case 'MISSING_PHONE':
        solutions.push('Add phone numbers to your shipping addresses');
        solutions.push('Phone numbers are required for UPS shipments');
        solutions.push('Use format: +1 (555) 123-4567 or 555-123-4567');
        break;
        
      case 'INVALID_ADDRESS':
        solutions.push('Verify all address fields are complete');
        solutions.push('Check postal codes and state/province abbreviations');
        solutions.push('Ensure addresses match carrier service areas');
        break;
        
      case 'PACKAGE_DIMENSIONS_INVALID':
        solutions.push('Check package dimensions are positive numbers');
        solutions.push('Verify weight and dimensions are realistic');
        solutions.push('Consider using carrier-specific package types');
        break;
        
      case 'NO_RATES_FOUND':
        solutions.push('Check that carrier is active and configured');
        solutions.push('Verify shipping addresses are in service areas');
        solutions.push('Try different package dimensions or weight');
        break;
        
      default:
        if (error.suggestions && error.suggestions.length > 0) {
          solutions.push(...error.suggestions);
        } else {
          solutions.push('Check your configuration and try again');
          solutions.push('Contact support if the issue persists');
        }
    }

    return solutions;
  };

  const getDocumentationLink = (code: string): string | null => {
    switch (true) {
      case code.includes('UPS'):
        return 'https://docs.lovable.dev/shipping/ups-setup';
      case code.includes('CANADA_POST'):
        return 'https://docs.lovable.dev/shipping/canada-post-setup';
      case code.includes('PHONE'):
        return 'https://docs.lovable.dev/shipping/phone-requirements';
      default:
        return 'https://docs.lovable.dev/shipping/troubleshooting';
    }
  };

  const solutions = getErrorSolutions(error);
  const documentationLink = getDocumentationLink(error.code);
  const canRetry = onRetry && retryCount < maxRetries;

  return (
    <Alert variant={getErrorSeverity(error.code)} className="my-4">
      <div className="flex items-start gap-3">
        {getErrorIcon(error.code)}
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="flex items-center gap-2">
              Shipping Error
              <Badge variant="outline" className="text-xs">
                {error.code}
              </Badge>
              {error.carrier && (
                <Badge variant="secondary" className="text-xs">
                  {error.carrier}
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {error.message}
            </AlertDescription>
          </div>

          {solutions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">How to fix this:</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm space-y-1">
                  {solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            {canRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Retry ({maxRetries - retryCount} attempts left)
              </Button>
            )}
            
            {documentationLink && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.open(documentationLink, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
                View Documentation
              </Button>
            )}
            
            {onClearError && (
              <Button
                onClick={onClearError}
                variant="ghost"
                size="sm"
              >
                Dismiss
              </Button>
            )}
          </div>

          {error.details && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="p-0 h-auto text-xs"
              >
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>
              
              {showDetails && (
                <div className="p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-32">
                  <pre>{JSON.stringify(error.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}