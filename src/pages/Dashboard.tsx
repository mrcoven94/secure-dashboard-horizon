
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, Users, Globe } from 'lucide-react';
import { fetchGroups } from '@/services/groupService';
import { Group } from '@/types/group';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// Sample dashboard URLs mapped to group IDs (would ideally come from a database)
const DASHBOARD_URLS: Record<string, string> = {
  'overview': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
  'demographics': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
  'geography': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDashboard, setCurrentDashboard] = useState<string | null>(null);
  
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
  
  // Get dashboard icon based on id
  const getDashboardIcon = (dashboardId: string) => {
    if (dashboardId.includes('overview')) return BarChart3;
    if (dashboardId.includes('demographic')) return Users;
    if (dashboardId.includes('geography')) return Globe;
    return BarChart3;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <CardTitle className="text-3xl font-bold tracking-tight">
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Explore insights from the Horizons Survey data
              </CardDescription>
            </motion.div>
          </CardHeader>
        </Card>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full grid grid-cols-1 gap-6"
        >
          {loading ? (
            <Card className="p-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          ) : currentDashboard ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  {dashboards.find(d => d.id === currentDashboard)?.name || 'Dashboard'}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDashboard(null)}
                >
                  Back to Dashboards
                </Button>
              </div>
              
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <DashboardEmbed 
                    dashboardId={currentDashboard}
                    title={dashboards.find(d => d.id === currentDashboard)?.name || 'Dashboard'} 
                    url={DASHBOARD_URLS[currentDashboard] || DASHBOARD_URLS.overview}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Available Dashboards</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboards.length > 0 ? (
                  dashboards.map((dashboard) => {
                    const Icon = getDashboardIcon(dashboard.id);
                    return (
                      <Card 
                        key={dashboard.id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setCurrentDashboard(dashboard.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="bg-primary/10 text-primary p-2 rounded-md">
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <CardTitle className="text-xl mt-2">{dashboard.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {dashboard.description || 'No description available'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full">View Dashboard</Button>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No dashboards available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
