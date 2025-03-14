
import React, { useEffect, useRef, useState } from 'react';
import { initializeTableauEmbed, TableauLoadError, applyTableauResponsiveStyles } from '@/utils/tableauEmbed';
import { Skeleton } from '@/components/ui/skeleton';
import { EmbedErrorState } from './EmbedErrorState';
import { toast } from 'sonner';

interface TableauEmbedRendererProps {
  embedCode: string;
  isLoading: boolean;
  onError: (error: Error) => void;
}

export function TableauEmbedRenderer({ 
  embedCode, 
  isLoading, 
  onError 
}: TableauEmbedRendererProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [errorType, setErrorType] = useState<TableauLoadError | null>(null);
  
  // Helper to check if container has tableau viz
  const hasTableauViz = () => {
    if (!embedContainerRef.current) return false;
    const vizElements = embedContainerRef.current.getElementsByClassName('tableauViz');
    return vizElements && vizElements.length > 0;
  };
  
  useEffect(() => {
    if (isLoading || !embedCode || !embedContainerRef.current) return;
    
    setIsRendering(true);
    setIsRendered(false);
    
    try {
      initializeTableauEmbed({
        container: embedContainerRef.current,
        embedCode,
        onError: (error) => {
          console.error('Error in Tableau embed:', error);
          setErrorType(error.message as TableauLoadError);
          onError(error);
          setIsRendering(false);
        }
      });
      
      // Check if tableau viz loaded correctly
      const checkVizLoaded = () => {
        if (hasTableauViz()) {
          console.log('Tableau viz elements detected');
          setIsRendered(true);
          applyTableauResponsiveStyles(embedContainerRef.current!);
        } else {
          console.warn('No tableau viz elements were found after initialization');
        }
        setIsRendering(false);
      };
      
      // Check for tableau viz elements after a short delay
      const timeout = setTimeout(checkVizLoaded, 2000);
      
      return () => clearTimeout(timeout);
    } catch (error) {
      console.error('Error initializing Tableau embed in renderer:', error);
      setErrorType(TableauLoadError.INITIALIZATION_FAILED);
      onError(error instanceof Error ? error : new Error('Failed to initialize Tableau embed'));
      setIsRendering(false);
    }
  }, [embedCode, isLoading, onError, renderAttempts]);
  
  // Check for invalid URLs in the embed code that might cause rendering issues
  useEffect(() => {
    if (!embedCode) return;
    
    // Look for invalid URLs in the embed code (common cause of tableau errors)
    const urlRegex = /(?:https?):\/\/[^\s/$.?#].[^\s\'\"")]*(?![^<>]*>)/gi;
    const urls = embedCode.match(urlRegex);
    
    if (urls) {
      urls.forEach(url => {
        try {
          new URL(url);
        } catch (error) {
          console.error('Invalid URL found in embed code:', url, error);
          setErrorType(TableauLoadError.INVALID_URL);
          onError(new Error(TableauLoadError.INVALID_URL));
        }
      });
    }
  }, [embedCode, onError]);
  
  const handleRetry = () => {
    setErrorType(null);
    setRenderAttempts(prev => prev + 1);
    toast.info('Retrying dashboard load...');
  };
  
  if (errorType) {
    return <EmbedErrorState errorType={errorType} onRetry={handleRetry} />;
  }
  
  if (isLoading || isRendering) {
    return (
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
    );
  }
  
  // Use conditional display to prevent flickering
  return (
    <div className="w-full h-full relative">
      <div 
        ref={embedContainerRef}
        className={`w-full h-full overflow-hidden transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Show fallback error if failed to render tableau viz */}
      {!isRendered && !isRendering && !errorType && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
          <EmbedErrorState 
            errorType={TableauLoadError.INITIALIZATION_FAILED} 
            onRetry={handleRetry} 
          />
        </div>
      )}
    </div>
  );
}
