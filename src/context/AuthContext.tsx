
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  permissions: string[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAccess: (dashboardId: string) => boolean;
};

// Initial mock users for demo purposes
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123', // In real app, this would be hashed
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
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in our demo data
      const foundUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Save user to state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (DEMO_USERS.some(u => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // In a real app, we would create a new user in the database
      // For this demo, we'll just pretend we did
      
      const newUser = {
        id: String(DEMO_USERS.length + 1),
        email,
        name,
        role: 'user' as const,
        permissions: ['dashboard1']
      };
      
      // Save user to state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Logged out');
    navigate('/login');
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
