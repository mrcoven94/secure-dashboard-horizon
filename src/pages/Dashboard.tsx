
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { fetchGroups } from '@/services/groupService';
import { Group } from '@/types/group';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

// Sample dashboard URLs mapped to group IDs (would ideally come from a database)
const DASHBOARD_URLS: Record<string, string> = {
  'overview': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
  'demographics': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
  'geography': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link'
};

// Sample dashboard group associations (would come from a database)
const DASHBOARD_GROUPS = {
  'overview': ['Sales Team', 'Executive', 'All Users'],
  'demographics': ['Marketing Team', 'Executive'],
  'geography': ['Sales Team', 'Regional Managers']
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboards on component mount
  useEffect(() => {
    async function loadDashboards() {
      try {
        setLoading(true);
        // For development environment, use mock data
        if (process.env.NODE_ENV === 'development') {
          const mockDashboards: Group[] = [
            {
              id: 'overview',
              name: 'Sales Overview',
              description: 'General sales metrics and KPIs',
              created_at: new Date().toISOString(),
              created_by: user?.id || '1',
              updated_at: new Date().toISOString()
            },
            {
              id: 'demographics',
              name: 'Customer Demographics',
              description: 'Customer segment analysis by age, gender, and income',
              created_at: new Date().toISOString(),
              created_by: user?.id || '1',
              updated_at: new Date().toISOString()
            },
            {
              id: 'geography',
              name: 'Geographic Distribution',
              description: 'Sales analysis by region and location',
              created_at: new Date().toISOString(),
              created_by: user?.id || '1',
              updated_at: new Date().toISOString()
            }
          ];
          setDashboards(mockDashboards);
          setLoading(false);
          return;
        }
        
        // For production, fetch from API
        const fetchedGroups = await fetchGroups();
        setDashboards(fetchedGroups);
      } catch (error) {
        console.error('Error loading dashboards:', error);
        toast.error('Failed to load dashboards');
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboards();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="h-screen overflow-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 h-full"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-6">
              {dashboards.map((dashboard) => (
                <Card 
                  key={dashboard.id}
                  className="w-full border border-border/40 bg-card/30 backdrop-blur-sm"
                >
                  <CardHeader className="pb-0">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-xl">{dashboard.name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {dashboard.description || 'No description available'}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs text-muted-foreground mr-1">Available to:</span>
                        {DASHBOARD_GROUPS[dashboard.id as keyof typeof DASHBOARD_GROUPS]?.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[500px] p-4">
                    <DashboardEmbed 
                      dashboardId={dashboard.id}
                      title={dashboard.name} 
                      url={DASHBOARD_URLS[dashboard.id] || DASHBOARD_URLS.overview}
                      hideControls={true}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
