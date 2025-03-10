
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccessRestrictedProps {
  status?: 'draft' | 'restricted';
}

export function AccessRestricted({ status = 'restricted' }: AccessRestrictedProps) {
  const isDraft = status === 'draft';
  
  return (
    <Card className={isDraft 
      ? "bg-yellow-50/30 backdrop-blur-sm border-yellow-200" 
      : "bg-muted/30 backdrop-blur-sm border-muted"
    }>
      <CardContent className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-4xl mb-4">{isDraft ? '📝' : '🔒'}</div>
        <CardTitle className="text-xl mb-2">
          {isDraft ? 'Dashboard in Draft Mode' : 'Access Restricted'}
        </CardTitle>
        <CardDescription className="text-center max-w-md mb-4">
          {isDraft 
            ? 'This dashboard is currently in draft mode and not accessible to users. Publish it to make it available.'
            : 'You don\'t have permission to view this dashboard. Please contact an administrator if you believe this is a mistake.'
          }
        </CardDescription>
        {isDraft && (
          <Button variant="outline" size="sm" className="mt-2">Contact Support</Button>
        )}
      </CardContent>
    </Card>
  );
}
