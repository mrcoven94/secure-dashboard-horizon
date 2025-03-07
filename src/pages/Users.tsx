
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle, SearchIcon, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateUserAdminStatus } from '@/services/groupService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type User = {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdminSwitchLoading, setIsAdminSwitchLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        if (!user) return;
        
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [user]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Handle admin status change
  const handleAdminStatusChange = async (userId: string, isAdmin: boolean) => {
    if (!user?.role === 'admin') {
      toast.error('Only admins can change user permissions');
      return;
    }

    try {
      setIsAdminSwitchLoading(true);
      await updateUserAdminStatus(userId, isAdmin);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_admin: isAdmin } : u
        )
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_admin: isAdmin });
      }
      
      toast.success(`User ${isAdmin ? 'promoted to admin' : 'demoted from admin'}`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update user permissions');
    } finally {
      setIsAdminSwitchLoading(false);
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage user accounts and permissions
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>No Users Found</CardTitle>
                  <CardDescription>
                    There are no users registered in the system yet
                  </CardDescription>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p>Users will appear here once they register in the application.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map(userData => (
                <Card key={userData.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(userData.email)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base">{userData.email}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {userData.is_admin ? (
                          <>
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            <span>Administrator</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>Regular User</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Joined</span>
                        <span>{new Date(userData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(userData)}
                      disabled={user?.id === userData.id}
                    >
                      Manage Permissions
                    </Button>
                    {userData.is_admin && (
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User Permissions</DialogTitle>
              <DialogDescription>
                Update admin status for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-switch">Administrator Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Admins can manage users and have full access to all features
                    </p>
                  </div>
                  <Switch 
                    id="admin-switch"
                    checked={selectedUser.is_admin}
                    onCheckedChange={(checked) => handleAdminStatusChange(selectedUser.id, checked)}
                    disabled={isAdminSwitchLoading}
                  />
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Important Note
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Granting admin privileges gives this user complete control over all aspects of the application. 
                    Please ensure this user is trusted before proceeding.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
