
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
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

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' 
          : 'py-4 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-semibold">H</span>
          </div>
          <span className="font-medium text-xl hidden md:inline-block">Horizons Analytics</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={cn(
              "text-sm transition-colors hover:text-primary",
              location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  location.pathname.startsWith('/dashboard') ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                Dashboards
              </Link>
              
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={cn(
                    "text-sm transition-colors hover:text-primary",
                    location.pathname === '/admin' ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="gap-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/login?signup=true">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link 
                to="/" 
                className={cn(
                  "px-4 py-2 rounded-md transition-colors",
                  location.pathname === '/' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-muted'
                )}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors",
                      location.pathname.startsWith('/dashboard') 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted'
                    )}
                  >
                    Dashboards
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={cn(
                        "px-4 py-2 rounded-md transition-colors",
                        location.pathname === '/admin' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                      )}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 mt-2"
                      onClick={logout}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2 flex flex-col gap-2">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/login?signup=true" className="w-full">
                    <Button className="w-full">Sign up</Button>
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
