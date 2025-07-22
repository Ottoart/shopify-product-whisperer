
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DOMAINS } from '@/config/domains';

export default function CanadaPostCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Canada Post authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      const state = searchParams.get('state');
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      if (!state) {
        setStatus('error');
        setMessage('Missing authorization state parameter');
        return;
      }

      try {
        // The callback function will handle the OAuth verification
        const response = await fetch(
          `${DOMAINS.SUPABASE_FUNCTIONS}/canada-post-oauth-callback?state=${state}&code=${code || ''}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
          }
        );

        if (response.ok) {
          setStatus('success');
          setMessage('Canada Post account successfully connected!');
          toast({
            title: "Success",
            description: "Canada Post account connected successfully",
          });
          
          // Redirect to carriers page after 2 seconds
          setTimeout(() => {
            navigate('/settings');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to complete authorization');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authorization');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Canada Post Authorization
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your Canada Post connection...'}
            {status === 'success' && 'Authorization completed successfully'}
            {status === 'error' && 'Authorization failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <p className="text-xs text-muted-foreground">
              Redirecting to settings page...
            </p>
          )}
          
          {status === 'error' && (
            <Button onClick={() => navigate('/settings')} variant="outline">
              Return to Settings
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
