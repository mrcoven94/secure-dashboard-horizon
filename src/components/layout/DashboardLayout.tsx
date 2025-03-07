
import React, { useState } from 'react';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, Settings, BarChart2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="animate-pulse-subtle space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <span className="text-white font-semibold text-2xl">H</span>
          </div>
          <div className="h-2 w-24 bg-muted rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/80">
      <Header />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex flex-col mt-16 bg-card/50 backdrop-blur-sm border-r border-border/40 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-[72px]"
          )}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
            {sidebarOpen && (
              <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 ml-auto"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !sidebarOpen && "justify-center px-2",
                  "h-10"
                )}
              >
                <LayoutDashboard size={18} />
                {sidebarOpen && <span>Dashboard</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !sidebarOpen && "justify-center px-2",
                  "h-10"
                )}
              >
                <BarChart2 size={18} />
                {sidebarOpen && <span>Analytics</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !sidebarOpen && "justify-center px-2",
                  "h-10"
                )}
              >
                <Globe size={18} />
                {sidebarOpen && <span>Regions</span>}
              </Button>
              
              {user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    !sidebarOpen && "justify-center px-2",
                    "h-10"
                  )}
                >
                  <Users size={18} />
                  {sidebarOpen && <span>Users</span>}
                </Button>
              )}
              
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !sidebarOpen && "justify-center px-2",
                  "h-10"
                )}
              >
                <Settings size={18} />
                {sidebarOpen && <span>Settings</span>}
              </Button>
            </div>
          </nav>
          
          {sidebarOpen && (
            <div className="p-3 border-t border-border/40 mt-auto">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="font-medium truncate">{user?.name || user?.email}</p>
              </div>
            </div>
          )}
        </motion.aside>
        
        {/* Main content */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-[72px]"
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
