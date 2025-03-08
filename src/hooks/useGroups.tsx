
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Group } from '@/types/group';
import { supabase } from '@/lib/supabase';

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development environment, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Sample data structure
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
      
      // For production, fetch from Supabase
      const { data, error } = await supabase
        .from('groups')
        .select('*');
        
      if (error) throw error;
      
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      // Use mock data as fallback even in production if there's an error
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

  const createGroup = async (name: string, description: string) => {
    try {
      // For development, add to mock data
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
      
      // For production, insert in Supabase
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
      // For development, update mock data
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
      
      // For production, update in Supabase
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
      // For development, remove from mock data
      if (process.env.NODE_ENV === 'development') {
        const filteredGroups = groups.filter(group => group.id !== id);
        setGroups(filteredGroups);
        return true;
      }
      
      // For production, delete from Supabase
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

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
