
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Maximize, Minimize, ChevronLeft, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

interface DashboardEmbedProps {
  dashboardId: string;
  title: string;
  url?: string;
  embedCode?: string;
  hideControls?: boolean;
  status?: 'draft' | 'published';
}

export function DashboardEmbed({ 
  dashboardId, 
  title, 
  url, 
  embedCode, 
  hideControls = false,
  status = 'published'
}: DashboardEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { checkAccess } = useAuth();
  const embedContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if user has access to this dashboard
  const hasAccess = checkAccess(dashboardId);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle embed code initialization
  useEffect(() => {
    if (!isLoading && embedCode && embedContainerRef.current) {
      try {
        // Clear previous content
        embedContainerRef.current.innerHTML = '';
        
        // Insert the embed code HTML
        embedContainerRef.current.innerHTML = embedCode;
        
        // Find and execute all scripts in the embed code
        const scripts = embedContainerRef.current.getElementsByTagName('script');
        
        Array.from(scripts).forEach(oldScript => {
          const newScript = document.createElement('script');
          
          // Copy all attributes from the old script to the new script
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy the content of the script
          newScript.innerHTML = oldScript.innerHTML;
          
          // Replace the old script with the new one to execute it
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
        
        console.log('Tableau embed initialized');
      } catch (error) {
        console.error('Error initializing embed code:', error);
        setHasError(true);
        toast.error('Failed to load dashboard visualization');
      }
    }
  }, [isLoading, embedCode]);
  
  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard refreshed');
    }, 1500);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  
  if (!hasAccess) {
    return (
      <Card className="bg-muted/30 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-4xl mb-4">🔒</div>
          <CardTitle className="text-xl mb-2">Access Restricted</CardTitle>
          <CardDescription className="text-center max-w-md mb-4">
            You don't have permission to view this dashboard. Please contact an administrator if you believe this is a mistake.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Show a "draft mode" message if the dashboard is not published
  if (status === 'draft') {
    return (
      <Card className="bg-yellow-50/30 backdrop-blur-sm border-yellow-200">
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-4xl mb-4">📝</div>
          <CardTitle className="text-xl mb-2">Dashboard in Draft Mode</CardTitle>
          <CardDescription className="text-center max-w-md mb-4">
            This dashboard is currently in draft mode and not accessible to users. Publish it to make it available.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 p-4 bg-background/95 flex flex-col" : "relative"
      )}
    >
      {!hideControls && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-lg font-medium">{title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </Button>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "w-full rounded-lg border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm",
          isLoading && "animate-pulse",
          isFullscreen ? "flex-1" : "h-[70vh]"
        )}
      >
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <Skeleton className="w-16 h-16 rounded-full mb-6" />
            <Skeleton className="w-64 h-5 rounded-full mb-3" />
            <Skeleton className="w-40 h-4 rounded-full mb-8" />
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <Skeleton className="h-24 rounded-md" />
              <Skeleton className="h-24 rounded-md" />
              <Skeleton className="h-24 rounded-md" />
            </div>
          </div>
        ) : hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center text-muted-foreground max-w-md mx-auto text-center">
              <FileX className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />
              <h3 className="text-lg font-medium mb-2">Dashboard Unavailable</h3>
              <p className="text-sm mb-6">
                The dashboard could not be loaded. This might be due to network issues or the dashboard may be temporarily unavailable.
              </p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : embedCode ? (
          <div 
            ref={embedContainerRef}
            className="w-full h-full p-2 overflow-auto"
          />
        ) : (
          <iframe 
            src={url} 
            frameBorder="0" 
            allowFullScreen={true}
            className="w-full h-full"
            onError={handleIframeError}
          />
        )}
      </motion.div>
    </div>
  );
}
