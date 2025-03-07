
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSelector } from '@/components/dashboard/DashboardSelector';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, PieChart, Loader2 } from 'lucide-react';
import { fetchGroups } from '@/services/groupService';
import { Group } from '@/types/group';
import { toast } from 'sonner';

// Sample dashboard URLs mapped to group IDs (would ideally come from a database)
const DASHBOARD_URLS: Record<string, string> = {
  'overview': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
  'demographics': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
  'geography': 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link'
};

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDashboard, setCurrentDashboard] = useState('');
  const [activeTab, setActiveTab] = useState('dashboards');
  
  // Fetch groups on component mount
  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        const fetchedGroups = await fetchGroups();
        setGroups(fetchedGroups);
        
        // Set the default dashboard to the first group if available
        if (fetchedGroups.length > 0) {
          setCurrentDashboard(fetchedGroups[0].id);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
        toast.error('Failed to load dashboard groups');
      } finally {
        setLoading(false);
      }
    }
    
    loadGroups();
  }, []);
  
  const handleSelectDashboard = (dashboardId: string) => {
    setCurrentDashboard(dashboardId);
    setActiveTab('view');
  };

  // Find the currently selected group
  const currentGroup = groups.find(group => group.id === currentDashboard);
  
  // Map group categories to dashboard URLs
  const getDashboardUrl = (group: Group | undefined) => {
    if (!group) return '';
    
    // Map group names to URL keys (lowercase and normalize)
    const normalizedName = group.name.toLowerCase().trim();
    
    if (normalizedName.includes('overview')) {
      return DASHBOARD_URLS.overview;
    } else if (normalizedName.includes('demographic')) {
      return DASHBOARD_URLS.demographics;
    } else if (normalizedName.includes('geography') || normalizedName.includes('regional')) {
      return DASHBOARD_URLS.geography;
    }
    
    // Default to overview if no match
    return DASHBOARD_URLS.overview;
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
          className="w-full"
        >
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="dashboards" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard Groups</span>
              </TabsTrigger>
              <TabsTrigger value="view" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Current View</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboards" className="mt-0">
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <DashboardSelector 
                      groups={groups}
                      currentDashboard={currentDashboard}
                      onSelect={handleSelectDashboard}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="view" className="mt-0">
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  {currentGroup ? (
                    <DashboardEmbed 
                      dashboardId={currentDashboard}
                      title={currentGroup.name}
                      url={getDashboardUrl(currentGroup)}
                    />
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      {groups.length > 0 ? 'Select a dashboard to view' : 'No dashboard groups available'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
