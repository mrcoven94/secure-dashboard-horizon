
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, User, Search, UserCog } from 'lucide-react';

// Sample user data
const INITIAL_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    dashboards: ['dashboard1', 'dashboard2', 'dashboard3']
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    dashboards: ['dashboard1']
  }
];

// Sample dashboard data for permissions
const DASHBOARDS = [
  { id: 'dashboard1', name: 'Survey Overview' },
  { id: 'dashboard2', name: 'Demographic Analysis' },
  { id: 'dashboard3', name: 'Regional Insights' }
];

export function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    dashboards: ['dashboard1'] // Default dashboard access
  });
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check if email is already in use
    if (users.some(user => user.email === newUser.email)) {
      toast.error('This email is already in use');
      return;
    }
    
    // Add new user
    const newUserWithId = {
      ...newUser,
      id: (users.length + 1).toString()
    };
    
    setUsers([...users, newUserWithId]);
    toast.success(`User ${newUser.name} has been added`);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      dashboards: ['dashboard1']
    });
    
    setIsAddUserOpen(false);
  };
  
  const handleOpenEditUser = (user: typeof users[0]) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    
    toast.success(`User ${editingUser.name} has been updated`);
    setIsEditUserOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User has been deleted');
  };
  
  const toggleDashboardAccess = (user: typeof users[0], dashboardId: string) => {
    return {
      ...user,
      dashboards: user.dashboards.includes(dashboardId)
        ? user.dashboards.filter(id => id !== dashboardId)
        : [...user.dashboards, dashboardId]
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and set their permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="role"
                        checked={newUser.role === 'user'}
                        onChange={() => setNewUser({...newUser, role: 'user'})}
                        className="h-4 w-4 text-primary"
                      />
                      <span>User</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="role"
                        checked={newUser.role === 'admin'}
                        onChange={() => setNewUser({...newUser, role: 'admin'})}
                        className="h-4 w-4 text-primary"
                      />
                      <span>Admin</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dashboard Access</Label>
                  <div className="space-y-2 border rounded-md p-3">
                    {DASHBOARDS.map(dashboard => (
                      <div key={dashboard.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-dashboard-${dashboard.id}`}
                          checked={newUser.dashboards.includes(dashboard.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewUser({
                                ...newUser,
                                dashboards: [...newUser.dashboards, dashboard.id]
                              });
                            } else {
                              setNewUser({
                                ...newUser,
                                dashboards: newUser.dashboards.filter(id => id !== dashboard.id)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`new-dashboard-${dashboard.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {dashboard.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>
                  Add User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {user.role === 'admin' ? <UserCog size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditUser(user)}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div>
                  <div className="mb-2 text-sm font-medium">Role</div>
                  <div className="flex h-8 w-20 items-center justify-center rounded-full text-xs font-medium capitalize bg-primary/10 text-primary">
                    {user.role}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="mb-2 text-sm font-medium">Dashboard Access</div>
                  <div className="flex flex-wrap gap-2">
                    {DASHBOARDS.map(dashboard => (
                      <div
                        key={dashboard.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.dashboards.includes(dashboard.id)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {dashboard.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No users found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="edit-role"
                      checked={editingUser.role === 'user'}
                      onChange={() => setEditingUser({...editingUser, role: 'user'})}
                      className="h-4 w-4 text-primary"
                    />
                    <span>User</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="edit-role"
                      checked={editingUser.role === 'admin'}
                      onChange={() => setEditingUser({...editingUser, role: 'admin'})}
                      className="h-4 w-4 text-primary"
                    />
                    <span>Admin</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dashboard Access</Label>
                <div className="space-y-2 border rounded-md p-3">
                  {DASHBOARDS.map(dashboard => (
                    <div key={dashboard.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-dashboard-${dashboard.id}`}
                        checked={editingUser.dashboards.includes(dashboard.id)}
                        onCheckedChange={() => {
                          setEditingUser(toggleDashboardAccess(editingUser, dashboard.id));
                        }}
                      />
                      <label
                        htmlFor={`edit-dashboard-${dashboard.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {dashboard.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
