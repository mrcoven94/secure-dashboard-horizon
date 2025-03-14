
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, UserCircle, Settings, Folders, Shield, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from './PageTransition';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();

  // Only render sidebar controls after mount to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="animate-pulse-subtle space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboards',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      showTo: 'all'
    },
    {
      name: 'Manage Dashboards',
      path: '/dashboard/manage',
      icon: <ListPlus size={18} />,
      showTo: 'all'
    },
    {
      name: 'Admin',
      path: '/admin',
      icon: <Shield size={18} />,
      showTo: 'admin'
    },
    {
      name: 'Users',
      path: '/users',
      icon: <UserCircle size={18} />,
      showTo: 'all'
    },
    {
      name: 'Groups',
      path: '/groups',
      icon: <Folders size={18} />,
      showTo: 'all'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={18} />,
      showTo: 'all'
    }
  ];

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
            "fixed inset-y-0 left-0 z-20 flex flex-col mt-16 bg-card/40 backdrop-blur-sm border-r border-border/40 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-[72px]"
          )}
        >
          {isMounted && (
            <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
              {sidebarOpen && (
                <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 ml-auto rounded-full hover:bg-muted/50"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </Button>
            </div>
          )}
          
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-2">
              {navItems.map((item) => {
                // Show admin items to admins OR to the specific email
                if (item.showTo === 'admin' && user?.role !== 'admin' && user?.email !== 'mrcoven94@gmail.com') {
                  return null;
                }
                
                // Show regular items to everyone
                if (item.showTo === 'all' || (item.showTo === 'admin' && (user?.role === 'admin' || user?.email === 'mrcoven94@gmail.com'))) {
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        !sidebarOpen && "justify-center px-2",
                        "h-10 hover:bg-muted/50 transition-colors duration-200"
                      )}
                      asChild
                    >
                      <Link to={item.path}>
                        {item.icon}
                        {sidebarOpen && <span>{item.name}</span>}
                      </Link>
                    </Button>
                  );
                }
                
                return null;
              })}
            </div>
          </nav>
          
          {sidebarOpen && (
            <div className="p-3 border-t border-border/40 mt-auto">
              <div className="px-3 py-2 rounded-md hover:bg-muted/30 transition-colors">
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="font-medium truncate">{user?.name || user?.email}</p>
              </div>
            </div>
          )}
        </motion.aside>
        
        {/* Main content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-[72px]"
          )}
        >
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
