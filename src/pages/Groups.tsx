
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folders, Plus, UserPlus, X, Users, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  email?: string;
};

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch groups
  useEffect(() => {
    async function fetchGroups() {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('groups')
          .select('*');

        if (error) throw error;
        setGroups(data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [user]);

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDesc.trim() || null,
          created_by: user.id,
        })
        .select();

      if (error) throw error;

      setGroups([...(data || []), ...groups]);
      setNewGroupName('');
      setNewGroupDesc('');
      setCreateDialogOpen(false);
      toast.success('Group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (group: Group) => {
    setGroupToEdit(group);
    setEditGroupName(group.name);
    setEditGroupDesc(group.description || '');
    setEditDialogOpen(true);
  };

  // Edit group
  const handleEditGroup = async () => {
    if (!editGroupName.trim() || !groupToEdit) {
      toast.error('Group name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: editGroupName.trim(),
          description: editGroupDesc.trim() || null,
        })
        .eq('id', groupToEdit.id);

      if (error) throw error;

      // Update the groups state with the edited group
      setGroups(groups.map(group => 
        group.id === groupToEdit.id 
          ? { ...group, name: editGroupName.trim(), description: editGroupDesc.trim() || null } 
          : group
      ));
      
      // If the edited group is currently selected, update selectedGroup too
      if (selectedGroup && selectedGroup.id === groupToEdit.id) {
        setSelectedGroup({
          ...selectedGroup,
          name: editGroupName.trim(),
          description: editGroupDesc.trim() || null
        });
      }
      
      setEditDialogOpen(false);
      toast.success('Group updated successfully');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      // Fetch group members with profile information
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          group_id,
          user_id,
          role,
          profiles:user_id (email)
        `)
        .eq('group_id', groupId);
      
      if (error) throw error;

      // Format the data to get email from profiles
      const formattedData = data.map(member => {
        // Check if profiles exists and has a first item with email
        const profileEmail = Array.isArray(member.profiles) && member.profiles.length > 0
          ? member.profiles[0]?.email 
          : 'Unknown Email';
          
        return {
          id: member.id,
          group_id: member.group_id,
          user_id: member.user_id,
          role: member.role,
          email: profileEmail
        };
      });

      setGroupMembers(formattedData);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Add member to group
  const handleAddMember = async () => {
    if (!inviteEmail.trim() || !selectedGroup) {
      toast.error('Email is required');
      return;
    }

    try {
      // First, find if user exists by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim())
        .single();

      if (profileError) {
        toast.error('User not found with this email');
        return;
      }

      // Add user to group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: selectedGroup.id,
          user_id: profiles.id,
          role: 'member',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('User is already a member of this group');
        } else {
          throw error;
        }
        return;
      }

      // Refresh members list
      await fetchGroupMembers(selectedGroup.id);
      setInviteEmail('');
      setInviteDialogOpen(false);
      toast.success('Member added to group successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member to group');
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!selectedGroup) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Refresh members list
      setGroupMembers(groupMembers.filter(member => member.id !== memberId));
      toast.success('Member removed from group');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleOpenGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(groups.filter(group => group.id !== groupId));
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
            <p className="text-muted-foreground">
              Organize users into functional groups for better collaboration
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Group
            </Button>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="my">My Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : groups.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Folders className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No groups found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {user?.role === 'admin' 
                          ? 'Create your first group to get started'
                          : 'You have not been added to any groups yet'}
                      </p>
                      {user?.role === 'admin' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Create Group
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map(group => (
                    <Card key={group.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle>{group.name}</CardTitle>
                        {group.description && (
                          <CardDescription>
                            {group.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Created on {new Date(group.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleOpenGroup(group)}
                        >
                          <Users className="mr-2 h-4 w-4" /> View Members
                        </Button>
                        {user?.role === 'admin' && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenEditDialog(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-4">
              {/* Similar to "all" tab but filtered by groups created by the user */}
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : groups.filter(g => g.created_by === user?.id).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Folders className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No groups created</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You haven't created any groups yet
                      </p>
                      {user?.role === 'admin' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Create Group
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {groups
                    .filter(g => g.created_by === user?.id)
                    .map(group => (
                      <Card key={group.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle>{group.name}</CardTitle>
                          {group.description && (
                            <CardDescription>
                              {group.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Created on {new Date(group.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="secondary" 
                            onClick={() => handleOpenGroup(group)}
                          >
                            <Users className="mr-2 h-4 w-4" /> View Members
                          </Button>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenEditDialog(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Group Members View */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedGroup.name} - Members</CardTitle>
                  <CardDescription>
                    Manage users in this group
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedGroup(null)}
                  >
                    <X className="mr-2 h-4 w-4" /> Close
                  </Button>
                  <Button 
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : groupMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No members in this group</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add members to this group to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map(member => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between py-2 px-4 rounded-md hover:bg-muted"
                      >
                        <div>
                          <div className="font-medium">{member.email || 'Unknown Email'}</div>
                          <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize users and manage access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input 
                id="edit-name" 
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input 
                id="edit-description" 
                value={editGroupDesc}
                onChange={(e) => setEditGroupDesc(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGroup}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Group</DialogTitle>
            <DialogDescription>
              Add a user to {selectedGroup?.name} by email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input 
                id="email" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
