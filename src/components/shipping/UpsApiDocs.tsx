import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, RefreshCcw, FileText, ExternalLink } from "lucide-react";
import { useUpsApiDocs } from "@/hooks/useUpsApiDocs";
import { Badge } from "@/components/ui/badge";

export function UpsApiDocs() {
  const { docs, loading, fetchUpsApiDocs } = useUpsApiDocs();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-md flex items-center gap-2">
            <Github className="h-4 w-4" />
            UPS API Documentation
          </CardTitle>
          <CardDescription>
            Sync with GitHub to get the latest UPS API documentation and examples
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchUpsApiDocs()}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Syncing...' : 'Sync with GitHub'}
        </Button>
      </CardHeader>
      <CardContent>
        {docs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
            <Github className="h-10 w-10 mb-2 opacity-50" />
            <p>Click "Sync with GitHub" to fetch UPS API documentation</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => fetchUpsApiDocs()}
            >
              Sync Now
            </Button>
          </div>
        )}
        
        {docs.length > 0 && (
          <div className="space-y-4">
            <div className={`grid gap-3 ${isOpen ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {(isOpen ? docs : docs.slice(0, 3)).map((doc, i) => (
                <a 
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-3 rounded-md border hover:bg-accent/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {doc.title}
                      <ExternalLink className="h-3 w-3 inline opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </a>
              ))}
            </div>
            
            {docs.length > 3 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setIsOpen(!isOpen)}
                className="mx-auto block"
              >
                {isOpen ? 'Show less' : `Show ${docs.length - 3} more documents`}
              </Button>
            )}
            
            <div className="pt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Github className="h-3 w-3 mr-1" />
                UPS-API/api-documentation
              </Badge>
              <Badge variant="outline" className="text-xs">
                Last synced: {new Date().toLocaleString()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}