
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardList } from '@/components/dashboard/DashboardList';
import { DashboardDialog } from '@/components/dashboard/DashboardDialog';
import { useDashboards } from '@/hooks/useDashboards';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

export function DashboardManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const {
    dashboards,
    loading,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  } = useDashboards();
  
  // Filter dashboards based on search query
  const filteredDashboards = dashboards.filter(dashboard => 
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dashboard.description && dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort dashboards based on sortBy value
  const sortedDashboards = [...filteredDashboards].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleCreateDashboard = async (dashboard: {
    name: string;
    description?: string;
    embedType: 'url' | 'code';
    url?: string;
    embedCode?: string;
    visibility: string;
    status: 'draft' | 'published';
    groups: string[];
  }) => {
    try {
      console.log('Creating dashboard with:', dashboard);
      
      await createDashboard({
        name: dashboard.name,
        description: dashboard.description || '',
        url: dashboard.embedType === 'url' ? dashboard.url : undefined,
        embed_code: dashboard.embedType === 'code' ? dashboard.embedCode : undefined,
        visibility: dashboard.visibility,
        status: dashboard.status,
        groups: dashboard.groups || [],
      });
      
      setCreateDialogOpen(false);
      toast.success('Dashboard created successfully');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast.error('Failed to create dashboard');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your analytics dashboards
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Dashboard
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboards..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <Card>
            <CardContent className="p-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : sortedDashboards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No dashboards found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  {searchQuery 
                    ? `No dashboards match your search query "${searchQuery}"`
                    : 'Get started by creating your first dashboard'}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <DashboardGrid dashboards={sortedDashboards} onDelete={deleteDashboard} onUpdate={updateDashboard} />
        ) : (
          <DashboardList dashboards={sortedDashboards} onDelete={deleteDashboard} onUpdate={updateDashboard} />
        )}
      </motion.div>

      <DashboardDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateDashboard} 
        mode="create"
      />
    </div>
  );
}
