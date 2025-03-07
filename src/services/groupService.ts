import { supabase } from '@/lib/supabase';
import { Group, GroupMember, ExistingUser } from '@/types/group';

export async function fetchGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function fetchGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      user_id,
      role,
      profiles:user_id(email)
    `)
    .eq('group_id', groupId);
  
  if (error) throw error;

  // Format the data to get email from profiles
  return data.map(member => {
    // Extract email, handling different possible structures
    let email = 'Unknown Email';
    if (member.profiles) {
      if (Array.isArray(member.profiles)) {
        // If it's an array, take the first item's email
        email = member.profiles.length > 0 && member.profiles[0]?.email 
          ? member.profiles[0].email 
          : 'Unknown Email';
      } else if (typeof member.profiles === 'object' && member.profiles !== null) {
        // If it's an object, safely access its email property
        email = member.profiles.hasOwnProperty('email') && typeof member.profiles.email === 'string'
          ? member.profiles.email 
          : 'Unknown Email';
      }
    }

    return {
      id: member.id,
      group_id: member.group_id,
      user_id: member.user_id,
      role: member.role,
      email: email
    };
  });
}

export async function fetchExistingUsers() {
  try {
    // Fetch profiles directly without relying on complex relationships
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .order('email');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching existing users:', error);
    // Return empty array as fallback to prevent UI from breaking
    return [];
  }
}

export async function createGroup(
  name: string, 
  description: string | null, 
  userId: string, 
  selectedUsers: ExistingUser[], 
  initialMembers: string[]
) {
  // Create the group
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userId,
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
      throw memberError;
    }
  }

  // Process initial members (email invites)
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

      // For non-existing users, in a real app, you would implement an invitation system
      // For this demo, we'll just count it as successful
      return { email, success: true };
    });

    await Promise.all(addMembersPromises);
  }

  return newGroup;
}

export async function updateGroup(groupId: string, name: string, description: string | null) {
  const { error } = await supabase
    .from('groups')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .eq('id', groupId);

  if (error) throw error;
}

export async function deleteGroup(groupId: string) {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
}

export async function addMemberToGroup(groupId: string, email: string) {
  // Find if user exists by email
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim())
    .single();

  if (profileError) {
    throw new Error('User not found with this email');
  }

  // Add user to group
  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: profiles.id,
      role: 'member',
    });

  if (error) {
    if (error.code === '23505') {
      throw new Error('User is already a member of this group');
    }
    throw error;
  }
}

export async function removeMemberFromGroup(memberId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user admin status:', error);
    throw error;
  }
}
