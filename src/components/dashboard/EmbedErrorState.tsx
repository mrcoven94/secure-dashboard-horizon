
import React from 'react';
import { FileX, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { TableauLoadError } from '@/utils/tableauEmbed';
import { motion } from 'framer-motion';

interface EmbedErrorStateProps {
  errorType?: TableauLoadError;
  onRetry: () => void;
}

export function EmbedErrorState({ errorType, onRetry }: EmbedErrorStateProps) {
  // Determine which error type to show
  const getErrorDetails = () => {
    switch (errorType) {
      case TableauLoadError.NETWORK_ERROR:
        return {
          icon: <WifiOff className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />,
          title: 'Network Error',
          description: 'Unable to connect to the dashboard service. Please check your internet connection and try again.'
        };
      case TableauLoadError.SCRIPT_EXECUTION_FAILED:
        return {
          icon: <AlertTriangle className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />,
          title: 'Script Error',
          description: 'The dashboard scripts failed to execute. This may be caused by ad blockers or browser extensions.'
        };
      default:
        return {
          icon: <FileX className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />,
          title: 'Dashboard Unavailable',
          description: 'The dashboard could not be loaded. This might be due to technical issues or the dashboard may be temporarily unavailable.'
        };
    }
  };

  const { icon, title, description } = getErrorDetails();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col items-center justify-center p-4"
    >
      <div className="flex flex-col items-center justify-center text-muted-foreground max-w-md mx-auto text-center">
        {icon}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.open('https://help.tableau.com/current/pro/desktop/en-us/embed.htm', '_blank')}>
            Get Help
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
