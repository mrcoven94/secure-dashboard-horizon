
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'mrcoven94@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const mockUsers = [
          { 
            id: '1', 
            email: 'admin@example.com', 
            isAdmin: true, 
            lastSignIn: new Date().toISOString() 
          },
          { 
            id: '2', 
            email: 'user@example.com', 
            isAdmin: false, 
            lastSignIn: new Date().toISOString() 
          },
          { 
            id: '3', 
            email: 'dev@example.com', 
            isAdmin: false, 
            lastSignIn: new Date().toISOString() 
          },
          { 
            id: '4', 
            email: 'mrcoven94@gmail.com', 
            isAdmin: true, 
            lastSignIn: new Date().toISOString() 
          }
        ];
        setUsers(mockUsers);
        setLoading(false);
        return;
      }
      
      // For production, fetch from API
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email');
        
      if (error) throw error;
      
      const formattedUsers = data.map(user => ({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin === true,
        lastSignIn: user.last_sign_in
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      // Update Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: makeAdmin })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: makeAdmin } 
          : user
      ));
      
      toast.success(`User admin status updated successfully`);
    } catch (error) {
      console.error('Error updating user admin status:', error);
      toast.error('Failed to update user admin status');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and system settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement 
                users={users}
                loading={loading}
                onToggleAdmin={handleToggleAdmin}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
