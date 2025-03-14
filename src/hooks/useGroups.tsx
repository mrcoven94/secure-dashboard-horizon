import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Group, ExistingUser, GroupMember } from '@/types/group';
import { supabase } from '@/lib/supabase';
import { fetchGroupMembers, fetchExistingUsers, addMemberToGroup, removeMemberFromGroup } from '@/services/groupService';

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [initialMembers, setInitialMembers] = useState<string[]>([]);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ExistingUser[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchAvailableUsers();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (process.env.NODE_ENV === 'development') {
        const mockGroups: Group[] = [
          {
            id: '1',
            name: 'Marketing Team',
            description: 'Marketing department and campaign planning',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || '1',
            member_count: 8
          },
          {
            id: '2',
            name: 'Sales Team',
            description: 'Sales representatives and account managers',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user?.id || '1',
            member_count: 12
          },
          {
            id: '3',
            name: 'Executive',
            description: 'C-level executives and directors',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user?.id || '1',
            member_count: 4
          }
        ];
        
        setGroups(mockGroups);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('groups')
        .select('*');
        
      if (error) throw error;
      
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Marketing Team',
          description: 'Marketing department and campaign planning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || '1',
          member_count: 8
        },
        {
          id: '2',
          name: 'Sales Team',
          description: 'Sales representatives and account managers',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user?.id || '1',
          member_count: 12
        },
        {
          id: '3',
          name: 'Executive',
          description: 'C-level executives and directors',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user?.id || '1',
          member_count: 4
        }
      ];
      setGroups(mockGroups);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      
      if (process.env.NODE_ENV === 'development') {
        const mockUsers: ExistingUser[] = [
          { id: '1', email: 'user1@example.com' },
          { id: '2', email: 'user2@example.com' },
          { id: '3', email: 'user3@example.com' },
          { id: '4', email: 'user4@example.com' },
        ];
        
        setExistingUsers(mockUsers);
        setLoadingUsers(false);
        return;
      }
      
      const users = await fetchExistingUsers();
      setExistingUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      
      const mockUsers: ExistingUser[] = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
        { id: '3', email: 'user3@example.com' },
        { id: '4', email: 'user4@example.com' },
      ];
      
      setExistingUsers(mockUsers);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      setLoadingMembers(true);
      
      if (process.env.NODE_ENV === 'development') {
        const mockMembers: GroupMember[] = [
          { id: '1', group_id: groupId, user_id: '1', role: 'admin', email: 'admin@example.com' },
          { id: '2', group_id: groupId, user_id: '2', role: 'member', email: 'member1@example.com' },
          { id: '3', group_id: groupId, user_id: '3', role: 'member', email: 'member2@example.com' },
        ];
        
        setGroupMembers(mockMembers);
        setLoadingMembers(false);
        return;
      }
      
      const members = await fetchGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
      
      const mockMembers: GroupMember[] = [
        { id: '1', group_id: groupId, user_id: '1', role: 'admin', email: 'admin@example.com' },
        { id: '2', group_id: groupId, user_id: '2', role: 'member', email: 'member1@example.com' },
        { id: '3', group_id: groupId, user_id: '3', role: 'member', email: 'member2@example.com' },
      ];
      
      setGroupMembers(mockMembers);
    } finally {
      setLoadingMembers(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const newGroup: Group = {
          id: String(groups.length + 1),
          name,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || '1',
          member_count: 0
        };
        
        setGroups([...groups, newGroup]);
        return newGroup;
      }
      
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          created_by: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setGroups([...groups, data]);
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      throw error;
    }
  };

  const updateGroup = async (id: string, name: string, description: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const updatedGroups = groups.map(group => {
          if (group.id === id) {
            return {
              ...group,
              name,
              description,
              updated_at: new Date().toISOString()
            };
          }
          return group;
        });
        
        setGroups(updatedGroups);
        return updatedGroups.find(g => g.id === id);
      }
      
      const { data, error } = await supabase
        .from('groups')
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedGroups = groups.map(group => {
        if (group.id === id) return data;
        return group;
      });
      
      setGroups(updatedGroups);
      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
      throw error;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const filteredGroups = groups.filter(group => group.id !== id);
        setGroups(filteredGroups);
        return true;
      }
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setGroups(groups.filter(group => group.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
      throw error;
    }
  };

  const handleOpenGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup(newGroupName, newGroupDesc);
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setSelectedUsers([]);
      toast.success('Group created successfully');
    } catch (error) {
      console.error('Error in handleCreateGroup:', error);
    }
  };

  const handleOpenEditDialog = (group: Group) => {
    setEditGroupName(group.name);
    setEditGroupDesc(group.description || '');
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const handleEditGroup = async () => {
    try {
      if (!selectedGroup) return;
      
      await updateGroup(selectedGroup.id, editGroupName, editGroupDesc);
      setEditDialogOpen(false);
      toast.success('Group updated successfully');
    } catch (error) {
      console.error('Error in handleEditGroup:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id);
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteGroup:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      if (!selectedGroup) return;
      
      if (process.env.NODE_ENV === 'development') {
        const newMember: GroupMember = {
          id: String(groupMembers.length + 1),
          group_id: selectedGroup.id,
          user_id: String(Math.floor(Math.random() * 1000)),
          role: 'member',
          email: inviteEmail
        };
        
        setGroupMembers([...groupMembers, newMember]);
        const updatedGroups = groups.map(group => {
          if (group.id === selectedGroup.id) {
            return {
              ...group,
              member_count: (group.member_count || 0) + 1
            };
          }
          return group;
        });
        
        setGroups(updatedGroups);
        setInviteDialogOpen(false);
        setInviteEmail('');
        toast.success(`Added ${inviteEmail} to the group`);
        return;
      }
      
      await addMemberToGroup(selectedGroup.id, inviteEmail);
      await fetchMembers(selectedGroup.id);
      await fetchGroups();
      
      setInviteDialogOpen(false);
      setInviteEmail('');
      toast.success(`Added ${inviteEmail} to the group`);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member to group');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!selectedGroup) return;
      
      if (process.env.NODE_ENV === 'development') {
        const updatedMembers = groupMembers.filter(member => member.id !== memberId);
        setGroupMembers(updatedMembers);
        
        const updatedGroups = groups.map(group => {
          if (group.id === selectedGroup.id) {
            return {
              ...group,
              member_count: Math.max(0, (group.member_count || 0) - 1)
            };
          }
          return group;
        });
        
        setGroups(updatedGroups);
        toast.success('Member removed from group');
        return;
      }
      
      await removeMemberFromGroup(memberId);
      await fetchMembers(selectedGroup.id);
      await fetchGroups();
      
      toast.success('Member removed from group');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member from group');
    }
  };

  const handleSelectUser = (userId: string) => {
    const selectedUser = existingUsers.find(user => user.id === userId);
    
    if (selectedUser) {
      setSelectedUsers(prev => [...prev, selectedUser]);
    }
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    
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
    handleRemoveSelectedUser,
  };
}

export type { ExistingUser };
