
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSelector } from '@/components/dashboard/DashboardSelector';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';

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
  
  const handleSelectDashboard = (dashboardId: string) => {
    setCurrentDashboard(dashboardId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            Analytics Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Explore insights from the Horizons Survey data
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DashboardSelector 
            currentDashboard={currentDashboard}
            onSelect={handleSelectDashboard}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xs rounded-lg p-6"
        >
          <DashboardEmbed 
            dashboardId={currentDashboard}
            title={DASHBOARDS[currentDashboard as keyof typeof DASHBOARDS].title}
            url={DASHBOARDS[currentDashboard as keyof typeof DASHBOARDS].url}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
