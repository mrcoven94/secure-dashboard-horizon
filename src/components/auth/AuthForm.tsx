
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('signup') ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoginLoading(true);
      await login(loginEmail, loginPassword);
      // Navigation is handled in the login function
    } catch (error) {
      // Error handling is done in the login function
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsSignupLoading(true);
      await signup(signupEmail, signupPassword, signupName);
      // Navigation is handled in the signup function
    } catch (error) {
      // Error handling is done in the signup function
      setIsSignupLoading(false);
    }
  };
  
  // Demo quick login
  const handleDemoLogin = async (type: 'admin' | 'user') => {
    const email = type === 'admin' ? 'admin@example.com' : 'user@example.com';
    const password = 'password123';
    
    try {
      setIsLoginLoading(true);
      await login(email, password);
    } catch (error) {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <Card className="glass-card border border-gray-100 dark:border-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="#" 
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Demo: Password reset is not implemented');
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? 'Signing in...' : 'Sign in'}
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign up
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('user')}
                    disabled={isLoginLoading}
                  >
                    Demo User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isLoginLoading}
                  >
                    Demo Admin
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your details to create a new account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSignupLoading}
                >
                  {isSignupLoading ? 'Creating account...' : 'Create account'}
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => setActiveTab('login')}
                  >
                    Sign in
                  </button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
