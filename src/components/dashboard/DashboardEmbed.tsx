
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface DashboardEmbedProps {
  dashboardId: string;
  title: string;
  url: string;
}

export function DashboardEmbed({ dashboardId, title, url }: DashboardEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { checkAccess } = useAuth();
  
  // Check if user has access to this dashboard
  const hasAccess = checkAccess(dashboardId);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard refreshed');
    }, 1500);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] rounded-lg border border-gray-200 dark:border-gray-800 bg-muted/50">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-medium mb-2">Access Restricted</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          You don't have permission to view this dashboard. Please contact an administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 p-4 bg-background/95 flex flex-col" : "relative"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </Button>
        </div>
      </div>
      
      <div 
        className={cn(
          "tableau-embed-container flex-1",
          isLoading && "animate-pulse"
        )}
      >
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="w-64 h-4 rounded-full mb-2" />
            <Skeleton className="w-40 h-4 rounded-full" />
          </div>
        ) : (
          // This would be a real Tableau embed in production
          // Here we're just showing a placeholder
          <iframe 
            src={url} 
            frameBorder="0" 
            allowFullScreen={true}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
