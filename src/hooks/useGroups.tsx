
import { useState, useEffect } from 'react';
import { Group } from '@/types/group';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development environment, use mock data if Supabase call fails
      if (process.env.NODE_ENV === 'development') {
        try {
          const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setGroups(data);
        } catch (err) {
          console.error('Error fetching groups:', err);
          
          // Fallback to mock data if Supabase call fails
          setGroups([
            { id: '1', name: 'Sales Team', description: 'Sales department personnel', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', name: 'Marketing Team', description: 'Marketing department personnel', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', name: 'Executive', description: 'Executive leadership', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '4', name: 'Regional Managers', description: 'Regional management team', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '5', name: 'All Users', description: 'All platform users', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ]);
        }
      } else {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch groups'));
      
      // Fallback to mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        setGroups([
          { id: '1', name: 'Sales Team', description: 'Sales department personnel', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Marketing Team', description: 'Marketing department personnel', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', name: 'Executive', description: 'Executive leadership', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '4', name: 'Regional Managers', description: 'Regional management team', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '5', name: 'All Users', description: 'All platform users', created_by: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([
          { name, description }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      setGroups([data, ...groups]);
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      throw error;
    }
  };

  const updateGroup = async (id: string, name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setGroups(groups.map(group => group.id === id ? data : group));
      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
      throw error;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
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
    deleteGroup
  };
}
