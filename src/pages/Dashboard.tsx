
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardEmbed } from '@/components/dashboard/DashboardEmbed';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileX, Plus, Settings } from 'lucide-react';
import { fetchGroups } from '@/services/groupService';
import { Group } from '@/types/group';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDashboards } from '@/hooks/useDashboards';

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboards, loading } = useDashboards();
  
  // Only display published dashboards to regular users
  const publishedDashboards = dashboards.filter(dashboard => dashboard.status === 'published');

  const EmptyDashboardState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-8 h-[60vh]"
    >
      <div className="flex flex-col items-center justify-center text-center max-w-md">
        <FileX className="h-16 w-16 mb-6 sm:h-20 sm:w-20 md:h-24 md:w-24 text-muted-foreground/70" />
        <h2 className="text-xl font-semibold mb-3">No Dashboards Available</h2>
        <p className="text-muted-foreground mb-6">
          There are no analytics dashboards available at this time. Please check back later or contact your administrator.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          {user?.role === 'admin' && (
            <Button asChild>
              <Link to="/dashboard/manage">
                <Plus className="h-4 w-4 mr-2" /> Add Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen overflow-auto pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 md:p-6 max-w-7xl mx-auto"
        >
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
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
            </div>
            
            <div className="flex gap-2">
              {user?.role === 'admin' && (
                <Button variant="outline" asChild>
                  <Link to="/dashboard/manage">
                    <Settings className="h-4 w-4 mr-2" /> Manage Dashboards
                  </Link>
                </Button>
              )}
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading dashboards...</p>
              </div>
            </div>
          ) : publishedDashboards.length === 0 ? (
            <EmptyDashboardState />
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {publishedDashboards.map((dashboard, index) => (
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
                          {dashboard.groups?.map((group) => (
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
                        url={dashboard.url || dashboard.tableau_url}
                        embedCode={dashboard.embed_code}
                        hideControls={true}
                        status={dashboard.status}
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
