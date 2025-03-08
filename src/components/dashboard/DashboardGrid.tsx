
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MoreHorizontal, Edit, Trash2, ExternalLink, Users, Eye, EyeOff } from 'lucide-react';
import { Dashboard } from '@/types/dashboard';
import { DashboardDialog } from '@/components/dashboard/DashboardDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface DashboardGridProps {
  dashboards: Dashboard[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Dashboard>) => void;
}

export function DashboardGrid({ dashboards, onDelete, onUpdate }: DashboardGridProps) {
  const navigate = useNavigate();
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);

  const handleEdit = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setEditDialogOpen(true);
  };

  const handleDelete = (dashboardId: string) => {
    setDashboardToDelete(dashboardId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dashboardToDelete) {
      onDelete(dashboardToDelete);
      setDeleteDialogOpen(false);
      setDashboardToDelete(null);
    }
  };

  const handleUpdateDashboard = (data: any) => {
    if (editingDashboard) {
      onUpdate(editingDashboard.id, data);
      setEditDialogOpen(false);
      setEditingDashboard(null);
    }
  };

  const getThumbnailUrl = (dashboard: Dashboard) => {
    if (dashboard.thumbnail_url) return dashboard.thumbnail_url;
    return 'https://placehold.co/600x400/e2e8f0/6b7280?text=Dashboard';
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.div 
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        {dashboards.map((dashboard) => (
          <motion.div key={dashboard.id} variants={itemAnimation}>
            <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md border border-border/40">
              <div className="relative overflow-hidden aspect-video bg-muted/50">
                <img
                  src={getThumbnailUrl(dashboard)}
                  alt={dashboard.name}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/${dashboard.id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(dashboard)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(dashboard.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl truncate">{dashboard.name}</CardTitle>
                  {dashboard.visibility === 'public' ? (
                    <Badge variant="outline" className="bg-primary/10 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-secondary/10 text-xs">
                      <EyeOff className="h-3 w-3 mr-1" /> Private
                    </Badge>
                  )}
                </div>
                {dashboard.description && (
                  <CardDescription className="line-clamp-2 h-10">
                    {dashboard.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                {dashboard.groups && dashboard.groups.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {dashboard.groups.length} {dashboard.groups.length === 1 ? 'group' : 'groups'} have access
                    </span>
                  </div>
                )}
                {dashboard.groups && dashboard.groups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dashboard.groups.slice(0, 3).map((group, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                    {dashboard.groups.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{dashboard.groups.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                  <span>Created {formatDistanceToNow(new Date(dashboard.created_at), { addSuffix: true })}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" /> Open
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {editingDashboard && (
        <DashboardDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateDashboard}
          dashboard={editingDashboard}
          mode="edit"
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              dashboard and remove it from all groups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
