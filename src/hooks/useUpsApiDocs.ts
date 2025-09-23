import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UpsApiDoc {
  title: string;
  url: string;
  description: string;
}

export function useUpsApiDocs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<UpsApiDoc[]>([]);
  const { toast } = useToast();

  // Function to fetch UPS API documentation from GitHub
  async function fetchUpsApiDocs() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.github.com/repos/UPS-API/api-documentation/contents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch UPS API documentation');
      }
      
      const data = await response.json();
      
      // Filter for markdown docs and other useful files
      const apiDocs = data
        .filter((item: any) => 
          item.type === 'file' && 
          (item.name.endsWith('.md') || item.name.endsWith('.json')) && 
          !item.name.includes('LICENSE') &&
          !item.name.includes('README')
        )
        .map((item: any) => ({
          title: item.name.replace(/\.(md|json)$/i, '').replace(/-/g, ' '),
          url: item.html_url,
          description: `UPS API documentation: ${item.name}`
        }));
        
      // Add specific documentation links
      apiDocs.push({
        title: 'UPS OAuth Implementation',
        url: 'https://github.com/UPS-API/api-documentation/wiki/Authentication',
        description: 'Learn how to implement UPS OAuth authentication'
      });
      
      apiDocs.push({
        title: 'UPS Shipping API',
        url: 'https://github.com/UPS-API/api-documentation/wiki/Shipping-API',
        description: 'Documentation for the UPS Shipping API'
      });
      
      setDocs(apiDocs);
      
      toast({
        title: 'UPS API Documentation',
        description: `Successfully synchronized ${apiDocs.length} documentation files`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to sync UPS API docs: ${err.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    docs,
    fetchUpsApiDocs
  };
}