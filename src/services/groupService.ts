
import { supabase } from '@/lib/supabase';
import { Group, GroupMember, ExistingUser } from '@/types/group';

// Fetch all groups
export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as Group[];
}

// Fetch group members
export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  // First get the group members
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*, profiles(email)')
    .eq('group_id', groupId);
    
  if (membersError) throw membersError;
  
  // Format the response
  return members.map((member: any) => ({
    id: member.id,
    group_id: member.group_id,
    user_id: member.user_id,
    role: member.role,
    email: member.profiles?.email || null
  }));
}

// Fetch existing users for group member selection
export async function fetchExistingUsers(): Promise<ExistingUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .order('email');
    
  if (error) throw error;
  
  return data as ExistingUser[];
}

// Create a new group
export async function createGroup(
  name: string, 
  description: string, 
  created_by: string,
  selectedUsers: ExistingUser[],
  invitedEmails: string[]
): Promise<Group> {
  // First create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([
      { name, description: description || null, created_by }
    ])
    .select()
    .single();
    
  if (groupError) throw groupError;
  
  // If there are selected existing users, add them as members
  if (selectedUsers.length > 0) {
    const members = selectedUsers.map(user => ({
      group_id: group.id,
      user_id: user.id,
      role: 'member'
    }));
    
    const { error: membersError } = await supabase
      .from('group_members')
      .insert(members);
      
    if (membersError) throw membersError;
  }
  
  // Add the creator as an admin member
  const { error: creatorError } = await supabase
    .from('group_members')
    .insert([
      { group_id: group.id, user_id: created_by, role: 'admin' }
    ]);
    
  if (creatorError) throw creatorError;
  
  // In a real app, we would send invitations to the invited emails
  // For now, we'll just return the created group
  return group as Group;
}

// Update a group
export async function updateGroup(
  groupId: string,
  name: string,
  description: string
): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .update({ 
      name, 
      description: description || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', groupId);
    
  if (error) throw error;
}

// Delete a group
export async function deleteGroup(groupId: string): Promise<void> {
  // First delete all group members
  const { error: membersError } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId);
    
  if (membersError) throw membersError;
  
  // Then delete the group
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
    
  if (error) throw error;
}

// Add a member to a group
export async function addMemberToGroup(
  groupId: string,
  email: string
): Promise<void> {
  // Check if the user exists
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
    
  if (userError) throw userError;
  
  if (users.length === 0) {
    throw new Error(`User with email ${email} does not exist`);
  }
  
  const userId = users[0].id;
  
  // Check if the user is already a member
  const { data: existingMembers, error: existingError } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId);
    
  if (existingError) throw existingError;
  
  if (existingMembers.length > 0) {
    throw new Error(`User is already a member of this group`);
  }
  
  // Add the user to the group
  const { error } = await supabase
    .from('group_members')
    .insert([
      { group_id: groupId, user_id: userId, role: 'member' }
    ]);
    
  if (error) throw error;
}

// Remove a member from a group
export async function removeMemberFromGroup(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('id', memberId);
    
  if (error) throw error;
}

// Update user admin status
export async function updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);
    
  if (error) throw error;
}
