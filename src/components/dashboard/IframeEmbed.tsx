
import React, { useState } from 'react';
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
  
  const handleIframeError = () => {
    setHasError(true);
    onError(new Error(TableauLoadError.NETWORK_ERROR));
  };
  
  const handleRetry = () => {
    setHasError(false);
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
  
  return (
    <iframe 
      src={url} 
      frameBorder="0" 
      allowFullScreen={true}
      className="w-full h-full"
      onError={handleIframeError}
    />
  );
}
