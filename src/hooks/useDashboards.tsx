import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dashboard } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';

export function useDashboards() {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  // Fetch dashboards on component mount
  useEffect(() => {
    fetchDashboards();
  }, [user]);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development environment, use mock data
      if (process.env.NODE_ENV === 'development') {
        const mockDashboards: Dashboard[] = [
          {
            id: 'overview',
            name: 'Sales Overview',
            description: 'General sales metrics and KPIs',
            url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
            visibility: 'public',
            status: 'published',
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
            status: 'draft',
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
            status: 'published',
            groups: ['Sales Team', 'Regional Managers'],
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user?.id || '1',
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            group_count: 2,
            thumbnail_url: 'https://placehold.co/600x400/3e52b9/ffffff?text=Geography'
          },
          {
            id: 'embed-example',
            name: 'Housing Supply Dashboard',
            description: 'Embedded code dashboard example',
            embed_code: '<div class="tableauPlaceholder" id="viz1739491668083" style="position: relative"><noscript><a href="#"><img alt="Available Homes by Income - Homeownership Rate " src="https://public.tableau.com/static/images/Ho/HomesteadHousingSupplyDashboard2024_17255831409130/AvailableHomesbyIncome-HomeownershipRate/1_rss.png" style="border: none" /></a></noscript><object class="tableauViz" style="display:none;"><param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" /> <param name="embed_code_version" value="3" /> <param name="site_root" value="" /><param name="name" value="HomesteadHousingSupplyDashboard2024_17255831409130%2FAvailableHomesbyIncome-HomeownershipRate" /><param name="tabs" value="no" /><param name="toolbar" value="yes" /><param name="static_image" value="https%3A%2F%2Fpublic.tableau.com%2Fstatic%2Fimages%2FHo%2FHomesteadHousingSupplyDashboard2024_17255831409130%2FAvailableHomesbyIncome-HomeownershipRate%2F1.png" /> <param name="animate_transition" value="yes" /><param name="display_static_image" value="yes" /><param name="display_spinner" value="yes" /><param name="display_overlay" value="yes" /><param name="display_count" value="yes" /><param name="language" value="en-US" /></object></div><script type="text/javascript">var divElement = document.getElementById("viz1739491668083");var vizElement = divElement.getElementsByTagName("object")[0];vizElement.style.width="1400px";vizElement.style.height="927px";var scriptElement = document.createElement("script");scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";vizElement.parentNode.insertBefore(scriptElement, vizElement);</script>',
            visibility: 'public',
            status: 'published',
            groups: ['All Users'],
            created_at: new Date().toISOString(),
            created_by: user?.id || '1',
            updated_at: new Date().toISOString(),
            group_count: 1,
            thumbnail_url: 'https://placehold.co/600x400/e07a5f/ffffff?text=Housing'
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
      
      // Map the data to match our Dashboard type
      const mappedDashboards = dashboardsData.map((item: any) => ({
        id: item.id,
        name: item.title, // Map from 'title' to 'name'
        description: item.description,
        url: item.tableau_url,
        embed_code: item.embed_code,
        visibility: item.visibility,
        status: item.status || 'draft',
        groups: [],
        created_at: item.created_at,
        created_by: item.user_id,
        updated_at: item.updated_at,
        group_count: item.group_count || 0,
        thumbnail_url: item.thumbnail_url
      }));
      
      setDashboards(mappedDashboards);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      toast.error('Failed to load dashboards');
      
      // Use mock data as fallback even in production if there's an error
      const mockDashboards: Dashboard[] = [
        {
          id: 'overview',
          name: 'Sales Overview',
          description: 'General sales metrics and KPIs',
          url: 'https://public.tableau.com/views/SuperStoreSales_16798495258770/Overview?:language=en-US&:display_count=n&:origin=viz_share_link',
          visibility: 'public',
          status: 'published',
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
          status: 'draft',
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
          status: 'published',
          groups: ['Sales Team', 'Regional Managers'],
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user?.id || '1',
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          group_count: 2,
          thumbnail_url: 'https://placehold.co/600x400/3e52b9/ffffff?text=Geography'
        },
        {
          id: 'embed-example',
          name: 'Housing Supply Dashboard',
          description: 'Embedded code dashboard example',
          embed_code: '<div class="tableauPlaceholder" id="viz1739491668083" style="position: relative"><noscript><a href="#"><img alt="Available Homes by Income - Homeownership Rate " src="https://public.tableau.com/static/images/Ho/HomesteadHousingSupplyDashboard2024_17255831409130/AvailableHomesbyIncome-HomeownershipRate/1_rss.png" style="border: none" /></a></noscript><object class="tableauViz" style="display:none;"><param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" /> <param name="embed_code_version" value="3" /> <param name="site_root" value="" /><param name="name" value="HomesteadHousingSupplyDashboard2024_17255831409130%2FAvailableHomesbyIncome-HomeownershipRate" /><param name="tabs" value="no" /><param name="toolbar" value="yes" /><param name="static_image" value="https%3A%2F%2Fpublic.tableau.com%2Fstatic%2Fimages%2FHo%2FHomesteadHousingSupplyDashboard2024_17255831409130%2FAvailableHomesbyIncome-HomeownershipRate%2F1.png" /> <param name="animate_transition" value="yes" /><param name="display_static_image" value="yes" /><param name="display_spinner" value="yes" /><param name="display_overlay" value="yes" /><param name="display_count" value="yes" /><param name="language" value="en-US" /></object></div><script type="text/javascript">var divElement = document.getElementById("viz1739491668083");var vizElement = divElement.getElementsByTagName("object")[0];vizElement.style.width="1400px";vizElement.style.height="927px";var scriptElement = document.createElement("script");scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";vizElement.parentNode.insertBefore(scriptElement, vizElement);</script>',
          visibility: 'public',
          status: 'published',
          groups: ['All Users'],
          created_at: new Date().toISOString(),
          created_by: user?.id || '1',
          updated_at: new Date().toISOString(),
          group_count: 1,
          thumbnail_url: 'https://placehold.co/600x400/e07a5f/ffffff?text=Housing'
        }
      ];
      setDashboards(mockDashboards);
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
        .maybeSingle();
        
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
    url?: string;
    embed_code?: string;
    visibility: string;
    status?: 'draft' | 'published';
    groups: string[];
  }) => {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const newDashboard: Dashboard = {
          id: Math.random().toString(36).substring(2, 11),
          ...data,
          name: data.name,
          url: data.url,
          embed_code: data.embed_code,
          status: data.status || 'draft',
          created_at: new Date().toISOString(),
          created_by: user?.id || '1',
          updated_at: new Date().toISOString(),
          group_count: data.groups.length
        };
        
        setDashboards([newDashboard, ...dashboards]);
        toast.success('Dashboard created successfully');
        return newDashboard;
      }
      
      // For production, insert into Supabase with the correct field mappings
      console.log('Creating dashboard with data:', data);
      
      const { data: newDashboard, error } = await supabase
        .from('dashboards')
        .insert([
          {
            title: data.name,
            description: data.description || null,
            tableau_url: data.url || null,
            embed_code: data.embed_code || null,
            visibility: data.visibility,
            user_id: user?.id,
            group_count: data.groups.length || 0
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Dashboard created:', newDashboard);
      
      // Insert dashboard groups
      if (data.groups && data.groups.length > 0) {
        const dashboardGroups = data.groups.map(groupId => ({
          dashboard_id: newDashboard.id,
          group_id: groupId
        }));
        
        const { error: groupError } = await supabase
          .from('dashboard_groups')
          .insert(dashboardGroups);
          
        if (groupError) {
          console.error('Error adding dashboard groups:', groupError);
          toast.warning('Dashboard created but group assignments failed');
        }
      }
      
      // Convert to our Dashboard type
      const mappedDashboard: Dashboard = {
        id: newDashboard.id,
        name: newDashboard.title,
        description: newDashboard.description,
        url: newDashboard.tableau_url,
        embed_code: newDashboard.embed_code,
        visibility: newDashboard.visibility,
        status: 'draft',
        groups: data.groups,
        created_at: newDashboard.created_at,
        created_by: newDashboard.user_id,
        updated_at: newDashboard.updated_at,
        group_count: data.groups.length || 0
      };
      
      // Update local state
      setDashboards([mappedDashboard, ...dashboards]);
      toast.success('Dashboard created successfully');
      
      // Fetch the updated dashboards list
      fetchDashboards();
      
      return mappedDashboard;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast.error('Failed to create dashboard');
      throw error;
    }
  };

  const updateDashboard = async (id: string, data: Partial<Dashboard>) => {
    try {
      console.log('Updating dashboard:', id, data);
      
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
        toast.success('Dashboard updated successfully');
        return updatedDashboards.find(d => d.id === id);
      }
      
      // For production, update in Supabase with correct field mappings
      const updateData: any = {};
      
      if (data.name) updateData.title = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.url) updateData.tableau_url = data.url;
      if (data.embed_code !== undefined) updateData.embed_code = data.embed_code;
      if (data.visibility) updateData.visibility = data.visibility;
      updateData.updated_at = new Date().toISOString();
      
      const { data: updatedDashboard, error } = await supabase
        .from('dashboards')
        .update(updateData)
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
      toast.success('Dashboard updated successfully');
      
      return updatedDashboard;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast.error('Failed to update dashboard');
      throw error;
    }
  };

  const deleteDashboard = async (id: string) => {
    try {
      console.log('Deleting dashboard:', id);
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        const filteredDashboards = dashboards.filter(dashboard => dashboard.id !== id);
        setDashboards(filteredDashboards);
        toast.success('Dashboard deleted successfully');
        return true;
      }
      
      // First delete dashboard groups (if using Supabase)
      const { error: groupsError } = await supabase
        .from('dashboard_groups')
        .delete()
        .eq('dashboard_id', id);
        
      if (groupsError) {
        console.error('Error deleting dashboard groups:', groupsError);
        // Continue even if there's an error with group deletion
      }
      
      // Then delete the dashboard
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setDashboards(dashboards.filter(dashboard => dashboard.id !== id));
      toast.success('Dashboard deleted successfully');
      
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
    error,
    selectedDashboard,
    setSelectedDashboard,
    fetchDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  };
}
