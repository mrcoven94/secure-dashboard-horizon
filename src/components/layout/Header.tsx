
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' 
          : 'py-4 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-500/20 transition-all duration-300">
            <LineChart className="text-white h-5 w-5" />
          </div>
          <div className="hidden md:block">
            <span className="font-semibold text-xl text-foreground">Horizons</span>
            <span className="font-medium text-xl text-primary ml-1">Analytics</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <User size={15} className="text-white" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </motion.div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="gap-1 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/5">Log in</Button>
              </Link>
              <Link to="/login?signup=true">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-sm hover:shadow transition-all duration-300">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-primary/5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                    <div className="px-4 py-3 flex items-center gap-3 bg-muted/30 rounded-md">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 mt-3 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={logout}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-3 flex flex-col gap-2">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center">Log in</Button>
                  </Link>
                  <Link to="/login?signup=true" className="w-full">
                    <Button className="w-full justify-center bg-gradient-to-r from-indigo-500 to-blue-600">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
