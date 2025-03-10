
import React from 'react';
import { FileX } from 'lucide-react';

export function NoContent() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-muted-foreground max-w-md mx-auto text-center">
        <FileX className="h-16 w-16 mb-4 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />
        <h3 className="text-lg font-medium mb-2">No Dashboard Content</h3>
        <p className="text-sm mb-6">
          This dashboard doesn't have any content configured. Please add either an embed code or a URL.
        </p>
      </div>
    </div>
  );
}
