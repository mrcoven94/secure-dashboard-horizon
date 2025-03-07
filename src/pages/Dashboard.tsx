
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSelector } from '@/components/dashboard/DashboardSelector';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

// Sample dashboard data
const DASHBOARDS = {
  'dashboard1': {
    id: 'dashboard1',
    title: 'Survey Overview',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link'
  },
  'dashboard2': {
    id: 'dashboard2',
    title: 'Demographic Analysis',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link'
  },
  'dashboard3': {
    id: 'dashboard3',
    title: 'Regional Insights',
    url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link'
  }
};

export default function Dashboard() {
  const [currentDashboard, setCurrentDashboard] = useState('dashboard1');
  const [activeTab, setActiveTab] = useState('dashboards');
  
  const handleSelectDashboard = (dashboardId: string) => {
    setCurrentDashboard(dashboardId);
    setActiveTab('view');
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
                <span>Dashboard Catalog</span>
              </TabsTrigger>
              <TabsTrigger value="view" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Current View</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboards" className="mt-0">
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <DashboardSelector 
                    currentDashboard={currentDashboard}
                    onSelect={handleSelectDashboard}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="view" className="mt-0">
              <Card className="border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <DashboardEmbed 
                    dashboardId={currentDashboard}
                    title={DASHBOARDS[currentDashboard as keyof typeof DASHBOARDS].title}
                    url={DASHBOARDS[currentDashboard as keyof typeof DASHBOARDS].url}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
