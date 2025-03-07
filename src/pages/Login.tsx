
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already logged in
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-subtle opacity-40" />
          <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-100/80 blur-3xl dark:bg-blue-900/30" />
          <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl dark:bg-blue-800/20" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-semibold">H</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Horizons Analytics</h1>
              <p className="text-muted-foreground">
                Sign in to access your analytics dashboards
              </p>
            </div>
            
            <AuthForm />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
