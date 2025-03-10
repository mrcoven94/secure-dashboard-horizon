
import React, { useEffect, useRef, useState } from 'react';
import { initializeTableauEmbed, TableauLoadError } from '@/utils/tableauEmbed';
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
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [errorType, setErrorType] = useState<TableauLoadError | null>(null);
  
  useEffect(() => {
    if (isLoading || !embedCode || !embedContainerRef.current) return;
    
    setIsRendering(true);
    
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
      
      // Mark rendering as complete after a delay
      const timeout = setTimeout(() => {
        setIsRendering(false);
        console.log('Tableau rendering completed');
      }, 2000);
      
      return () => clearTimeout(timeout);
    } catch (error) {
      console.error('Error initializing Tableau embed in renderer:', error);
      setErrorType(TableauLoadError.INITIALIZATION_FAILED);
      onError(error instanceof Error ? error : new Error('Failed to initialize Tableau embed'));
      setIsRendering(false);
    }
  }, [embedCode, isLoading, onError, renderAttempts]);
  
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
  
  return (
    <div 
      ref={embedContainerRef}
      className="w-full h-full overflow-hidden"
    />
  );
}
