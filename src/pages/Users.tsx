
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { updateUserAdminStatus } from '@/services/groupService';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // For development, use mock data that includes the current user
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
            email: 'mrcoven94@gmail.com', 
            isAdmin: true, 
            lastSignIn: new Date().toISOString() 
          },
        ];
        
        // Add current user if not already in the list
        if (user && !mockUsers.some(u => u.email === user.email)) {
          mockUsers.push({
            id: user.id,
            email: user.email,
            isAdmin: user.role === 'admin',
            lastSignIn: new Date().toISOString()
          });
        }
        
        setUsers(mockUsers);
        setLoading(false);
        return;
      }
      
      // For production, fetch from Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('email');

      if (profilesError) {
        throw profilesError;
      }

      // Map profiles to the format needed for the component
      const userData = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        isAdmin: profile.is_admin === true, // Ensure this is a boolean
        lastSignIn: null // We don't have this information readily available
      }));

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      await updateUserAdminStatus(userId, makeAdmin);
      
      // Update the local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAdmin: makeAdmin } : u
      ));
      
      toast.success(`User admin status updated successfully`);
    } catch (error) {
      console.error('Error updating user admin status:', error);
      toast.error('Failed to update user admin status');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users in the system
          </p>
        </div>
        
        <UserManagement 
          users={users}
          loading={loading}
          onToggleAdmin={handleToggleAdmin}
        />
      </div>
    </DashboardLayout>
  );
}
