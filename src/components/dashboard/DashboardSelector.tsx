
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Globe, Users, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/types/group';

interface DashboardSelectorProps {
  groups: Group[];
  currentDashboard: string;
  onSelect: (dashboardId: string) => void;
}

export function DashboardSelector({ groups, currentDashboard, onSelect }: DashboardSelectorProps) {
  const [category, setCategory] = useState<string>('all');
  const { user, checkAccess } = useAuth();
  
  // Categorize groups based on their names
  const categorizeGroup = (group: Group): string => {
    const name = group.name.toLowerCase();
    if (name.includes('overview')) return 'overview';
    if (name.includes('demographic')) return 'demographics';
    if (name.includes('geography') || name.includes('regional')) return 'geography';
    return 'other';
  };
  
  // Filter groups based on user permissions and selected category
  const accessibleGroups = groups.filter(group => checkAccess(group.id));
  
  // Filter by category if not showing all
  const filteredGroups = category === 'all' 
    ? accessibleGroups 
    : accessibleGroups.filter(group => categorizeGroup(group) === category);

  // Get icon based on category
  const getGroupIcon = (group: Group) => {
    const category = categorizeGroup(group);
    switch (category) {
      case 'overview': return BarChart3;
      case 'demographics': return Users;
      case 'geography': return Globe;
      default: return BarChart3;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Dashboard Groups</h2>
          <p className="text-muted-foreground">Select a group to view detailed insights</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant={category === 'all' ? 'default' : 'outline'}
            onClick={() => setCategory('all')}
            className="h-8"
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={category === 'overview' ? 'default' : 'outline'}
            onClick={() => setCategory('overview')}
            className="h-8 flex items-center gap-1"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Overview</span>
          </Button>
          <Button 
            size="sm" 
            variant={category === 'demographics' ? 'default' : 'outline'}
            onClick={() => setCategory('demographics')}
            className="h-8 flex items-center gap-1"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Demographics</span>
          </Button>
          <Button 
            size="sm" 
            variant={category === 'geography' ? 'default' : 'outline'}
            onClick={() => setCategory('geography')}
            className="h-8 flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Geography</span>
          </Button>
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredGroups.map((group) => {
          const Icon = getGroupIcon(group);
          const groupCategory = categorizeGroup(group);
          
          return (
            <motion.div
              key={group.id}
              variants={item}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Card
                className={cn(
                  "h-full overflow-hidden transition-all hover:shadow-md",
                  currentDashboard === group.id ? 
                    "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-950" : 
                    "hover:border-primary/20"
                )}
                onClick={() => onSelect(group.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-0 h-5">
                      {groupCategory}
                    </Badge>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl mt-2">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{group.description || 'No description available'}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full"
                    variant={currentDashboard === group.id ? "default" : "secondary"}
                  >
                    {currentDashboard === group.id ? "Currently Viewing" : "View Dashboard"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
        
        {filteredGroups.length === 0 && (
          <motion.div 
            variants={item}
            className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg border-muted"
          >
            <Filter className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No dashboard groups found in this category</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCategory('all')}
            >
              Show all dashboard groups
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
