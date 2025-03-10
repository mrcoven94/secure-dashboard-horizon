
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TableauLoadError } from '@/utils/tableauEmbed';
import { EmbedControls } from './EmbedControls';
import { TableauEmbedRenderer } from './TableauEmbedRenderer';
import { IframeEmbed } from './IframeEmbed';
import { NoContent } from './NoContent';
import { AccessRestricted } from './AccessRestricted';

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
  const [errorType, setErrorType] = useState<TableauLoadError | null>(null);
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
    setHasError(false);
    setErrorType(null);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard refreshed');
    }, 1500);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleError = (error: Error) => {
    console.error('Dashboard error:', error);
    setHasError(true);
    setErrorType(error.message as TableauLoadError);
    toast.error('Failed to load dashboard visualization');
  };
  
  // Access restriction check
  if (!hasAccess) {
    return <AccessRestricted status="restricted" />;
  }

  // Draft mode check
  if (status === 'draft') {
    return <AccessRestricted status="draft" />;
  }

  // Create error message based on error type
  const errorMessage = hasError ? 
    (errorType === TableauLoadError.INVALID_URL ? 
      'The dashboard URL is invalid or improperly formatted. Please verify the URL and try again.' : 
      'Failed to load the dashboard. Please try refreshing or contact your administrator.') 
    : undefined;

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 p-4 bg-background/95 flex flex-col" : "relative"
      )}
    >
      <EmbedControls 
        title={title}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        onRefresh={handleRefresh}
        onToggleFullscreen={toggleFullscreen}
        hideControls={hideControls}
      />
      
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
        {embedCode ? (
          <TableauEmbedRenderer 
            embedCode={embedCode} 
            isLoading={isLoading} 
            onError={handleError} 
          />
        ) : url ? (
          <IframeEmbed 
            url={url} 
            isLoading={isLoading} 
            onError={handleError} 
          />
        ) : (
          <NoContent 
            onRefresh={handleRefresh} 
            isLoading={isLoading} 
            errorMessage={errorMessage}
          />
        )}

        {hasError && (url || embedCode) && (
          <NoContent 
            onRefresh={handleRefresh}
            errorMessage={errorMessage}
          />
        )}
      </motion.div>
    </div>
  );
}
