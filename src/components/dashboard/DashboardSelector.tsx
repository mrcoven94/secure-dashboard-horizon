
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Globe, Users, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Sample dashboard data
const DASHBOARDS = [
  {
    id: 'dashboard1',
    title: 'Survey Overview',
    description: 'High-level metrics and KPIs from the Horizons Survey',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'overview',
    icon: BarChart3
  },
  {
    id: 'dashboard2',
    title: 'Demographic Analysis',
    description: 'Detailed breakdown of survey participants by demographics',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'demographics',
    icon: Users
  },
  {
    id: 'dashboard3',
    title: 'Regional Insights',
    description: 'Geographic distribution and regional response patterns',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link',
    category: 'geography',
    icon: Globe
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Dashboard Catalog</h2>
          <p className="text-muted-foreground">Select a dashboard to view detailed insights</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant={category === 'all' ? 'default' : 'outline'}
            onClick={() => setCategory('all')}
            className="h-8"
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={category === 'overview' ? 'default' : 'outline'}
            onClick={() => setCategory('overview')}
            className="h-8 flex items-center gap-1"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Overview</span>
          </Button>
          <Button 
            size="sm" 
            variant={category === 'demographics' ? 'default' : 'outline'}
            onClick={() => setCategory('demographics')}
            className="h-8 flex items-center gap-1"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Demographics</span>
          </Button>
          <Button 
            size="sm" 
            variant={category === 'geography' ? 'default' : 'outline'}
            onClick={() => setCategory('geography')}
            className="h-8 flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Geography</span>
          </Button>
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredDashboards.map((dashboard) => (
          <motion.div
            key={dashboard.id}
            variants={item}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card
              className={cn(
                "h-full overflow-hidden transition-all hover:shadow-md",
                currentDashboard === dashboard.id ? 
                  "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-950" : 
                  "hover:border-primary/20"
              )}
              onClick={() => onSelect(dashboard.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0 h-5">
                    {dashboard.category}
                  </Badge>
                  <dashboard.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mt-2">{dashboard.title}</CardTitle>
                <CardDescription className="line-clamp-2">{dashboard.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full"
                  variant={currentDashboard === dashboard.id ? "default" : "secondary"}
                >
                  {currentDashboard === dashboard.id ? "Currently Viewing" : "View Dashboard"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        
        {filteredDashboards.length === 0 && (
          <motion.div 
            variants={item}
            className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg border-muted"
          >
            <Filter className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No dashboards found in this category</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCategory('all')}
            >
              Show all dashboards
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
