
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
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
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and their access to analytics dashboards
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserManagement />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
