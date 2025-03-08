
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dashboard } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';

export function useDashboards() {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  // Fetch dashboards on component mount
  useEffect(() => {
    fetchDashboards();
  }, [user]);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      
      // For development environment, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Sample data structure
        const mockDashboards: Dashboard[] = [
          {
            id: 'overview',
            name: 'Sales Overview',
            description: 'General sales metrics and KPIs',
            url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
            visibility: 'public',
            groups: ['Sales Team', 'Executive', 'All Users'],
            created_at: new Date().toISOString(),
            created_by: user?.id || '1',
            updated_at: new Date().toISOString(),
            group_count: 3
          },
          {
            id: 'demographics',
            name: 'Customer Demographics',
            description: 'Customer segment analysis by age, gender, and income',
            url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Customers?:language=en-US&:display_count=n&:origin=viz_share_link',
            visibility: 'private',
            groups: ['Marketing Team', 'Executive'],
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user?.id || '1',
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            group_count: 2
          },
          {
            id: 'geography',
            name: 'Geographic Distribution',
            description: 'Sales analysis by region and location',
            url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Geography?:language=en-US&:display_count=n&:origin=viz_share_link',
            visibility: 'private',
            groups: ['Sales Team', 'Regional Managers'],
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user?.id || '1',
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            group_count: 2,
            thumbnail_url: 'https://placehold.co/600x400/3e52b9/ffffff?text=Geography'
          }
        ];
        
        setDashboards(mockDashboards);
        setLoading(false);
        return;
      }
      
      // For production, fetch from Supabase
      const { data: dashboardsData, error } = await supabase
        .from('dashboards')
        .select('*');
        
      if (error) throw error;
      
      setDashboards(dashboardsData);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const getDashboard = async (id: string) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const dashboard = dashboards.find(d => d.id === id);
        if (dashboard) {
          setSelectedDashboard(dashboard);
          return dashboard;
        }
        return null;
      }
      
      // For production, fetch from API
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setSelectedDashboard(data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
      return null;
    }
  };

  const createDashboard = async (data: {
    name: string;
    description: string;
    url: string;
    visibility: string;
    groups: string[];
  }) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const newDashboard: Dashboard = {
          id: Math.random().toString(36).substring(2, 11),
          ...data,
          created_at: new Date().toISOString(),
          created_by: user?.id || '1',
          updated_at: new Date().toISOString(),
          group_count: data.groups.length
        };
        
        setDashboards([newDashboard, ...dashboards]);
        return newDashboard;
      }
      
      // For production, insert into Supabase
      const { data: newDashboard, error } = await supabase
        .from('dashboards')
        .insert([
          {
            title: data.name,
            description: data.description || null,
            tableau_url: data.url,
            visibility: data.visibility,
            user_id: user?.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Insert dashboard groups
      if (data.groups && data.groups.length > 0) {
        const dashboardGroups = data.groups.map(groupId => ({
          dashboard_id: newDashboard.id,
          group_id: groupId
        }));
        
        const { error: groupError } = await supabase
          .from('dashboard_groups')
          .insert(dashboardGroups);
          
        if (groupError) throw groupError;
      }
      
      // Fetch the updated dashboards list
      fetchDashboards();
      
      return newDashboard;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast.error('Failed to create dashboard');
      throw error;
    }
  };

  const updateDashboard = async (id: string, data: Partial<Dashboard>) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const updatedDashboards = dashboards.map(dashboard => {
          if (dashboard.id === id) {
            return {
              ...dashboard,
              ...data,
              updated_at: new Date().toISOString(),
              group_count: data.groups ? data.groups.length : dashboard.group_count
            };
          }
          return dashboard;
        });
        
        setDashboards(updatedDashboards);
        return updatedDashboards.find(d => d.id === id);
      }
      
      // For production, update in Supabase
      const { data: updatedDashboard, error } = await supabase
        .from('dashboards')
        .update({
          title: data.name,
          description: data.description || null,
          tableau_url: data.url,
          visibility: data.visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update dashboard groups
      if (data.groups) {
        // First delete all existing groups
        const { error: deleteError } = await supabase
          .from('dashboard_groups')
          .delete()
          .eq('dashboard_id', id);
          
        if (deleteError) throw deleteError;
        
        // Then insert new groups
        if (data.groups.length > 0) {
          const dashboardGroups = data.groups.map(groupId => ({
            dashboard_id: id,
            group_id: groupId
          }));
          
          const { error: groupError } = await supabase
            .from('dashboard_groups')
            .insert(dashboardGroups);
            
          if (groupError) throw groupError;
        }
      }
      
      // Fetch the updated dashboards list
      fetchDashboards();
      
      return updatedDashboard;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast.error('Failed to update dashboard');
      throw error;
    }
  };

  const deleteDashboard = async (id: string) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const filteredDashboards = dashboards.filter(dashboard => dashboard.id !== id);
        setDashboards(filteredDashboards);
        return true;
      }
      
      // First delete dashboard groups (if using Supabase)
      const { error: groupsError } = await supabase
        .from('dashboard_groups')
        .delete()
        .eq('dashboard_id', id);
        
      if (groupsError) throw groupsError;
      
      // Then delete the dashboard
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Fetch the updated dashboards list
      fetchDashboards();
      
      return true;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast.error('Failed to delete dashboard');
      throw error;
    }
  };

  return {
    dashboards,
    loading,
    selectedDashboard,
    setSelectedDashboard,
    fetchDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  };
}
