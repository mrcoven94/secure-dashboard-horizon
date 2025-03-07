import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  email?: string;
};

export type ExistingUser = {
  id: string;
  email: string;
};

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [initialMembers, setInitialMembers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ExistingUser[]>([]);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, [user]);

  // Fetch existing users when create group dialog is opened
  useEffect(() => {
    if (createDialogOpen) {
      fetchExistingUsers();
    }
  }, [createDialogOpen]);

  const fetchGroups = async () => {
    try {
      if (!user) return;

      setLoading(true);
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
  };

  // Fetch existing users from the profiles table
  const fetchExistingUsers = async () => {
    try {
      if (!user) return;

      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (error) throw error;
      setExistingUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      if (!user) return;

      // Create the group
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDesc.trim() || null,
          created_by: user.id,
        })
        .select();

      if (error) throw error;

      const newGroup = data?.[0];
      if (!newGroup) throw new Error('Failed to create group');

      // Add selected existing users
      if (selectedUsers.length > 0) {
        const membersToAdd = selectedUsers.map(selectedUser => ({
          group_id: newGroup.id,
          user_id: selectedUser.id,
          role: 'member',
        }));

        const { error: memberError } = await supabase
          .from('group_members')
          .insert(membersToAdd);

        if (memberError) {
          console.error('Failed to add existing users to group', memberError);
          toast.error('Failed to add some members to the group');
        }
      }

      // Add initial members (email invites) if provided
      if (initialMembers.length > 0) {
        const addMembersPromises = initialMembers.map(async (email) => {
          // Check if user already exists in the system
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.trim());

          if (profileError) {
            console.error(`Error checking if user exists: ${email}`, profileError);
            return { email, success: false };
          }

          // If user exists, add them directly
          if (profiles && profiles.length > 0) {
            const { error: memberError } = await supabase
              .from('group_members')
              .insert({
                group_id: newGroup.id,
                user_id: profiles[0].id,
                role: 'member',
              });

            if (memberError) {
              console.error(`Failed to add ${email} to group`, memberError);
              return { email, success: false };
            }
            return { email, success: true };
          }

          // For non-existing users, create an invite record
          // In a real app, you would implement a proper invitation system
          // For this demo, we'll just store the invited email in a toast notification
          toast.info(`Invitation would be sent to ${email}`);
          
          // TODO: Implement proper invitation system 
          // For now, we'll just count it as a successful operation
          return { email, success: true };
        });

        const results = await Promise.all(addMembersPromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        if (successful > 0 && failed === 0) {
          toast.success(`Added all ${successful} members to the group`);
        } else if (successful > 0 && failed > 0) {
          toast.info(`Added ${successful} members, but ${failed} failed. Check logs for details.`);
        } else if (failed > 0) {
          toast.error(`Failed to add ${failed} members. Check logs for details.`);
        }
      }

      setGroups([newGroup, ...groups]);
      resetCreateGroupForm();
      toast.success('Group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const resetCreateGroupForm = () => {
    setNewGroupName('');
    setNewGroupDesc('');
    setInitialMembers([]);
    setSelectedUsers([]);
    setCreateDialogOpen(false);
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

  // Delete group
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

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          group_id,
          user_id,
          role,
          profiles(email)
        `)
        .eq('group_id', groupId);
      
      if (error) throw error;

      // Format the data to get email from profiles
      const formattedData = data.map(member => {
        return {
          id: member.id,
          group_id: member.group_id,
          user_id: member.user_id,
          role: member.role,
          // Fix the typing issue by correctly accessing the nested profile data
          email: member.profiles?.email || 'Unknown Email'
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

  // Open group details and fetch members
  const handleOpenGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
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

  // Select user from existing users
  const handleSelectUser = (userId: string) => {
    const user = existingUsers.find(u => u.id === userId);
    if (user && !selectedUsers.some(u => u.id === userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Remove user from selection
  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  return {
    groups,
    loading,
    selectedGroup,
    setSelectedGroup,
    groupMembers,
    loadingMembers,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    inviteDialogOpen,
    setInviteDialogOpen,
    newGroupName,
    setNewGroupName,
    newGroupDesc,
    setNewGroupDesc,
    initialMembers,
    setInitialMembers,
    editGroupName,
    setEditGroupName,
    editGroupDesc,
    setEditGroupDesc,
    inviteEmail,
    setInviteEmail,
    handleCreateGroup,
    handleOpenEditDialog,
    handleEditGroup,
    handleDeleteGroup,
    handleOpenGroup,
    handleAddMember,
    handleRemoveMember,
    existingUsers,
    loadingUsers,
    selectedUsers,
    handleSelectUser,
    handleRemoveSelectedUser
  };
}
