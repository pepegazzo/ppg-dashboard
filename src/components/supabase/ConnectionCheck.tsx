
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ConnectionCheck: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      // Try to query the Supabase health endpoint
      const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to connect to Supabase');
    }
  };

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Supabase Connection</CardTitle>
        <CardDescription>
          Check if your app can connect to Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking connection...</span>
          </div>
        )}
        
        {status === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Connected successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              Your app is successfully connected to Supabase.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Connection failed</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Unable to connect to Supabase.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkConnection} 
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionCheck;
