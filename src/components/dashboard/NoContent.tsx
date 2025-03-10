
import React from 'react';
import { FileX, Plus, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

interface NoContentProps {
  onAddContent?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function NoContent({ onAddContent, onRefresh, isLoading = false }: NoContentProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-1" />
        <Skeleton className="h-4 w-56 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-28" />
          {isAdmin && <Skeleton className="h-9 w-28" />}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className={cn(
        "flex flex-col items-center justify-center text-muted-foreground max-w-md mx-auto text-center",
        "bg-muted/5 p-8 rounded-lg border border-border/30 shadow-sm"
      )}>
        <FileX className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />
        <h3 className="text-lg font-medium mb-2 text-foreground">No Dashboard Content</h3>
        <p className="text-sm mb-6 text-muted-foreground">
          {isAdmin 
            ? "This dashboard doesn't have any content configured. You can add either an embed code or a URL to display content."
            : "This dashboard doesn't have any content available at the moment. Please check back later or contact your administrator."}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          {isAdmin && onAddContent && (
            <Button 
              size="sm" 
              onClick={onAddContent}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Content
            </Button>
          )}
          
          {isAdmin && !onAddContent && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/manage'}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage Dashboards
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
