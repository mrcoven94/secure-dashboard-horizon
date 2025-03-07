import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Group, GroupMember, ExistingUser } from '@/types/group';
import {
  fetchGroups as apiGetGroups,
  fetchGroupMembers as apiGetGroupMembers,
  fetchExistingUsers as apiGetExistingUsers,
  createGroup as apiCreateGroup,
  updateGroup as apiUpdateGroup,
  deleteGroup as apiDeleteGroup,
  addMemberToGroup as apiAddMember,
  removeMemberFromGroup as apiRemoveMember
} from '@/services/groupService';

export { type Group, type GroupMember, type ExistingUser } from '@/types/group';

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
    if (user) {
      fetchGroupsData();
    }
  }, [user]);

  // Fetch existing users when create group dialog is opened
  useEffect(() => {
    if (createDialogOpen) {
      fetchExistingUsersData();
    }
  }, [createDialogOpen]);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      const data = await apiGetGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
      
      // Add fallback demo groups when there's an error
      if (process.env.NODE_ENV === 'development') {
        const demoGroups: Group[] = [
          {
            id: '1',
            name: 'Overview',
            description: 'General dashboard metrics',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || '1'
          },
          {
            id: '2',
            name: 'Demographics',
            description: 'User demographics data',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || '1'
          },
          {
            id: '3',
            name: 'Geography',
            description: 'Geographic distribution data',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || '1'
          }
        ];
        setGroups(demoGroups);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingUsersData = async () => {
    try {
      setLoadingUsers(true);
      const data = await apiGetExistingUsers();
      setExistingUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const demoUsers: ExistingUser[] = [
          { id: '1', email: 'admin@example.com' },
          { id: '2', email: 'user@example.com' },
          { id: '3', email: 'mrcoven94@gmail.com' }
        ];
        
        // Add current user if available
        if (user && !demoUsers.some(u => u.email === user.email)) {
          demoUsers.push({ id: user.id, email: user.email });
        }
        
        setExistingUsers(demoUsers);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchGroupMembersData = async (groupId: string) => {
    try {
      setLoadingMembers(true);
      const data = await apiGetGroupMembers(groupId);
      setGroupMembers(data);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const demoMembers: GroupMember[] = [
          { 
            id: '1', 
            group_id: groupId, 
            user_id: '1', 
            role: 'admin', 
            email: 'admin@example.com' 
          },
          { 
            id: '2', 
            group_id: groupId, 
            user_id: '2', 
            role: 'member', 
            email: 'user@example.com' 
          }
        ];
        
        // Add current user if available
        if (user) {
          demoMembers.push({ 
            id: '3', 
            group_id: groupId, 
            user_id: user.id, 
            role: 'admin', 
            email: user.email 
          });
        }
        
        setGroupMembers(demoMembers);
      }
    } finally {
      setLoadingMembers(false);
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

      const newGroup = await apiCreateGroup(
        newGroupName,
        newGroupDesc,
        user.id,
        selectedUsers,
        initialMembers
      );

      // Display appropriate toast notifications for invited members
      if (initialMembers.length > 0) {
        toast.info(`Invitation would be sent to ${initialMembers.length} email(s)`);
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
      await apiUpdateGroup(groupToEdit.id, editGroupName, editGroupDesc);

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
      await apiDeleteGroup(groupId);

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

  // Open group details and fetch members
  const handleOpenGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchGroupMembersData(group.id);
  };

  // Add member to group
  const handleAddMember = async () => {
    if (!inviteEmail.trim() || !selectedGroup) {
      toast.error('Email is required');
      return;
    }

    try {
      await apiAddMember(selectedGroup.id, inviteEmail);
      
      // Refresh members list
      await fetchGroupMembersData(selectedGroup.id);
      setInviteEmail('');
      setInviteDialogOpen(false);
      toast.success('Member added to group successfully');
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.message || 'Failed to add member to group');
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!selectedGroup) return;

      await apiRemoveMember(memberId);

      // Update the members list in state
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
