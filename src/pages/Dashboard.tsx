
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
      <div className="min-h-screen overflow-auto pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 md:p-6 max-w-7xl mx-auto"
        >
          <header className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-foreground/90 mb-2"
            >
              Analytics Dashboards
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-muted-foreground"
            >
              Explore your key metrics and insights
            </motion.p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading dashboards...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                >
                  <Card 
                    className="w-full border border-border/40 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader className="pb-2 pt-6">
                      <div className="flex flex-col gap-3">
                        <CardTitle className="text-xl md:text-2xl font-bold text-foreground/90">
                          {dashboard.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm md:text-base">
                          {dashboard.description || 'No description available'}
                        </CardDescription>
                        
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-xs text-muted-foreground mr-1 flex items-center">Available to:</span>
                          {DASHBOARD_GROUPS[dashboard.id as keyof typeof DASHBOARD_GROUPS]?.map((group) => (
                            <Badge key={group} variant="outline" className="text-xs py-0.5 bg-secondary/50">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[500px] sm:h-[550px] md:h-[600px] p-4">
                      <DashboardEmbed 
                        dashboardId={dashboard.id}
                        title={dashboard.name} 
                        url={DASHBOARD_URLS[dashboard.id] || DASHBOARD_URLS.overview}
                        hideControls={true}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
