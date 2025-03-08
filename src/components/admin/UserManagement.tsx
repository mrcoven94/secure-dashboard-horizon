
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, User, Search, UserCog } from 'lucide-react';

// Define the UserData type for props
export interface UserData {
  id: string;
  email: string;
  isAdmin: boolean;
  lastSignIn: string | null;
}

interface UserManagementProps {
  users: UserData[];
  loading: boolean;
  onToggleAdmin: (userId: string, makeAdmin: boolean) => Promise<void>;
}

export function UserManagement({ users, loading, onToggleAdmin }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="grid gap-6">
        {loading ? (
          <Card>
            <CardContent className="p-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserCog size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.email}</CardTitle>
                      <CardDescription>ID: {user.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={user.isAdmin ? "outline" : "default"}
                      size="sm"
                      onClick={() => onToggleAdmin(user.id, !user.isAdmin)}
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div>
                  <div className="mb-2 text-sm font-medium">Role</div>
                  <div className={`flex h-8 w-24 items-center justify-center rounded-full text-xs font-medium capitalize ${
                    user.isAdmin 
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </div>
                </div>
                {user.lastSignIn && (
                  <div className="mt-6">
                    <div className="mb-2 text-sm font-medium">Last Sign In</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.lastSignIn).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No users found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
