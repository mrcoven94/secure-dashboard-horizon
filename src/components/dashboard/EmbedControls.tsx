
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize, Minimize, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmbedControlsProps {
  title: string;
  isLoading: boolean;
  isFullscreen: boolean;
  onRefresh: () => void;
  onToggleFullscreen: () => void;
  onBack?: () => void;
  hideControls?: boolean;
}

export function EmbedControls({
  title,
  isLoading,
  isFullscreen,
  onRefresh,
  onToggleFullscreen,
  onBack = () => window.history.back(),
  hideControls = false
}: EmbedControlsProps) {
  if (hideControls) return null;
  
  return (
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
          onClick={onBack}
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
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </Button>
      </div>
    </motion.div>
  );
}
