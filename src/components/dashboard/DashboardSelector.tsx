
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

// Sample dashboard data
const DASHBOARDS = [
  {
    id: 'dashboard1',
    title: 'Survey Overview',
    description: 'High-level metrics and KPIs from the Horizons Survey',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'overview'
  },
  {
    id: 'dashboard2',
    title: 'Demographic Analysis',
    description: 'Detailed breakdown of survey participants by demographics',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'demographics'
  },
  {
    id: 'dashboard3',
    title: 'Regional Insights',
    description: 'Geographic distribution and regional response patterns',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'geography'
  }
];

interface DashboardSelectorProps {
  currentDashboard: string;
  onSelect: (dashboardId: string) => void;
}

export function DashboardSelector({ currentDashboard, onSelect }: DashboardSelectorProps) {
  const [category, setCategory] = useState<string>('all');
  const { user, checkAccess } = useAuth();
  
  // Filter dashboards based on user permissions
  const accessibleDashboards = DASHBOARDS.filter(dashboard => 
    checkAccess(dashboard.id)
  );
  
  // Filter by category if not showing all
  const filteredDashboards = category === 'all' 
    ? accessibleDashboards 
    : accessibleDashboards.filter(d => d.category === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboards</h2>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={category === 'all' ? 'default' : 'outline'}
            onClick={() => setCategory('all')}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={category === 'overview' ? 'default' : 'outline'}
            onClick={() => setCategory('overview')}
          >
            Overview
          </Button>
          <Button 
            size="sm" 
            variant={category === 'demographics' ? 'default' : 'outline'}
            onClick={() => setCategory('demographics')}
          >
            Demographics
          </Button>
          <Button 
            size="sm" 
            variant={category === 'geography' ? 'default' : 'outline'}
            onClick={() => setCategory('geography')}
          >
            Geography
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDashboards.map((dashboard) => (
          <div
            key={dashboard.id}
            className={cn(
              "glass-card p-4 cursor-pointer transition-all duration-300",
              currentDashboard === dashboard.id ? 
                "ring-2 ring-primary ring-offset-2" : 
                "hover:shadow-card-hover"
            )}
            onClick={() => onSelect(dashboard.id)}
          >
            <h3 className="font-medium text-lg mb-2">{dashboard.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{dashboard.description}</p>
            <Button 
              size="sm" 
              className="w-full"
              variant={currentDashboard === dashboard.id ? "default" : "outline"}
            >
              {currentDashboard === dashboard.id ? "Currently Viewing" : "View Dashboard"}
            </Button>
          </div>
        ))}
        
        {filteredDashboards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg border-gray-200 dark:border-gray-800">
            <p className="text-muted-foreground mb-2">No dashboards found in this category</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCategory('all')}
            >
              Show all dashboards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
