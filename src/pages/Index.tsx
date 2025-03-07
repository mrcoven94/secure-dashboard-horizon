
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users } from 'lucide-react';

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-subtle opacity-40" />
            <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-100/80 blur-3xl dark:bg-blue-900/30" />
            <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl dark:bg-blue-800/20" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Horizons Survey Analytics Portal
                </h1>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Access interactive dashboards and gain valuable insights from survey data through our secure analytics platform.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="gap-2">
                      <LayoutDashboard size={18} />
                      Go to Dashboards
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg">Get Started</Button>
                    </Link>
                    <Link to="/login?signup=true">
                      <Button variant="outline" size="lg">Create Account</Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Our analytics portal provides a comprehensive suite of tools for data analysis and visualization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <LayoutDashboard size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Dashboards</h3>
                <p className="text-muted-foreground">
                  Explore interactive visualizations that bring survey data to life with real-time filtering and drill-down capabilities.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                <p className="text-muted-foreground">
                  Role-based permissions ensure users only see the data they're authorized to access, maintaining data security.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  Administrators can easily manage user accounts, controlling dashboard access and permissions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tight">Ready to Explore Your Survey Data?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sign in to access the analytics dashboards and unlock valuable insights from the Horizons Survey.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg">Log In Now</Button>
                    </Link>
                    <Link to="/login?signup=true">
                      <Button variant="outline" size="lg">Create Account</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-semibold">H</span>
              </div>
              <span className="font-medium text-lg">Horizons Analytics</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Horizons Survey Project. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
