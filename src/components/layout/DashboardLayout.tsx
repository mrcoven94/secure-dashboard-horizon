
import React, { useState } from 'react';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-semibold">H</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex flex-col mt-16 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-[70px]"
          )}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
            {sidebarOpen && (
              <h3 className="text-sm font-medium">Navigation</h3>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <LayoutDashboard size={18} />
                {sidebarOpen && <span>Analytics</span>}
              </Button>
            </div>
          </nav>
        </aside>
        
        {/* Main content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out pt-4 px-4",
            sidebarOpen ? "ml-64" : "ml-[70px]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
