import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  permissions: string[];
};

type AuthContextType = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAccess: (dashboardId: string) => boolean;
};

// Initial test user data for fallback
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin' as const,
    permissions: ['dashboard1', 'dashboard2', 'dashboard3']
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'password123',
    name: 'Regular User',
    role: 'user' as const,
    permissions: ['dashboard1']
  },
  {
    id: '3',
    email: 'mrcoven94@gmail.com',
    password: 'password123',
    name: 'Your Admin',
    role: 'admin' as const,
    permissions: ['dashboard1', 'dashboard2', 'dashboard3']
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      handleAuthChange(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle auth state changes
  const handleAuthChange = async (session: Session | null) => {
    if (!session) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    try {
      // Special case for your email
      if (session.user.email === 'mrcoven94@gmail.com') {
        const adminUser: AppUser = {
          id: session.user.id,
          email: session.user.email,
          name: 'Your Admin',
          role: 'admin',
          permissions: ['dashboard1', 'dashboard2', 'dashboard3']
        };
        setUser(adminUser);
        setIsLoading(false);
        return;
      }
      
      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If no profile exists, try to create one
        if (error.code === 'PGRST116') {
          await createUserProfile(session.user);
        }
      }

      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', session.user.id);

      // Get dashboards the user has access to
      const { data: dashboardAccess } = await supabase
        .from('dashboard_groups')
        .select('dashboard_id')
        .eq('group_id', session.user.id);

      const permissions = dashboardAccess 
        ? dashboardAccess.map(d => d.dashboard_id) 
        : ['dashboard1']; // Default permission

      // Check if user has admin role
      const isAdmin = profile?.is_admin || 
        (userRoles && userRoles.some(r => r.roles && typeof r.roles === 'object' && 'name' in r.roles && r.roles.name === 'admin'));

      // Create user object
      const userObject: AppUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.email.split('@')[0] || session.user.email?.split('@')[0] || 'User',
        role: isAdmin ? 'admin' : 'user',
        permissions
      };

      setUser(userObject);
    } catch (error) {
      console.error('Error handling auth change:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a user profile if one doesn't exist
  const createUserProfile = async (user: User) => {
    try {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        is_admin: false
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Redirect authenticated users to dashboard if they access the login page
  useEffect(() => {
    if (user && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [user, location.pathname, navigate]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // As a fallback for demo, check if user exists in demo data
      if (process.env.NODE_ENV === 'development') {
        const foundUser = DEMO_USERS.find(
          u => u.email === email && u.password === password
        );
        
        if (foundUser) {
          // Remove password from user object
          const { password: _, ...userWithoutPassword } = foundUser;
          
          // Save user to state and localStorage for demo
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          toast.success('Logged in successfully (demo mode)');
          navigate('/dashboard');
          setIsLoading(false);
          return;
        }
      }
      
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Invalid credentials'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success('Account created successfully! Please check your email for verification.');
      } else {
        toast.info('Please check your email to complete sign up.');
      }
      
      // For demo purposes, we'll log them in right away
      if (process.env.NODE_ENV === 'development') {
        const newUser = {
          id: data.user?.id || String(DEMO_USERS.length + 1),
          email,
          name,
          role: 'user' as const,
          permissions: ['dashboard1']
        };
        
        setUser(newUser);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Signup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      toast.info('Logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Check if user has access to a specific dashboard
  const checkAccess = (dashboardId: string) => {
    if (!user) return false;
    return user.role === 'admin' || user.permissions.includes(dashboardId);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    checkAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
