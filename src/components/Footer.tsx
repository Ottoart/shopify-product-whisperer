import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-primary">PrepFox</h3>
            <p className="text-sm text-muted-foreground">
              Streamline your ecommerce operations across all marketplaces
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/privacy-policy')}
              className="justify-start md:justify-center"
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('https://123prepfox.com/privacy-policy/', '_blank')}
              className="justify-start md:justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Web Privacy Policy
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('mailto:privacy@123prepfox.com', '_blank')}
              className="justify-start md:justify-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PrepFox. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Secure marketplace data handling with enterprise-grade encryption
          </p>
        </div>
      </div>
    </footer>
  );
}