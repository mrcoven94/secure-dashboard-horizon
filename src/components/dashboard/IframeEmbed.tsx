
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmbedErrorState } from './EmbedErrorState';
import { TableauLoadError } from '@/utils/tableauEmbed';

interface IframeEmbedProps {
  url: string;
  isLoading: boolean;
  onError: (error: Error) => void;
}

export function IframeEmbed({ url, isLoading, onError }: IframeEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  // Validate URL before rendering iframe
  useEffect(() => {
    if (!url) return;
    
    try {
      // Test if the URL is valid
      new URL(url);
    } catch (error) {
      console.error('Invalid URL provided to IframeEmbed:', url, error);
      setHasError(true);
      onError(new Error(TableauLoadError.INVALID_URL));
    }
  }, [url, onError]);
  
  const handleIframeError = () => {
    console.error('Iframe failed to load:', url);
    setHasError(true);
    setIsRendered(false);
    onError(new Error(TableauLoadError.NETWORK_ERROR));
  };
  
  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIsRendered(true);
  };
  
  const handleRetry = () => {
    setHasError(false);
    setIsRendered(false);
  };
  
  if (isLoading) {
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
  
  if (hasError) {
    return <EmbedErrorState errorType={TableauLoadError.NETWORK_ERROR} onRetry={handleRetry} />;
  }
  
  // Use conditional display to prevent flashing blank iframes
  return (
    <div className="w-full h-full relative">
      <iframe 
        src={url} 
        frameBorder="0" 
        allowFullScreen={true}
        className={`w-full h-full transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
      
      {/* Show loading skeleton until iframe is fully rendered */}
      {!isRendered && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-secondary h-12 w-12 mb-4"></div>
            <div className="h-2 bg-secondary rounded w-48 mb-2"></div>
            <div className="h-2 bg-secondary rounded w-40"></div>
          </div>
        </div>
      )}
    </div>
  );
}
