
import React, { useState } from 'react';
import { Dashboard } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, ExternalLink, Eye, EyeOff, Users, FileCheck, ListFilter } from 'lucide-react';
import { DashboardDialog } from '@/components/dashboard/DashboardDialog';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardListProps {
  dashboards: Dashboard[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Dashboard>) => void;
}

export function DashboardList({ dashboards, onDelete, onUpdate }: DashboardListProps) {
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

  const handleTogglePublish = (dashboard: Dashboard) => {
    const newStatus = dashboard.status === 'published' ? 'draft' : 'published';
    onUpdate(dashboard.id, { status: newStatus });
    
    toast.success(
      newStatus === 'published' 
        ? 'Dashboard published successfully' 
        : 'Dashboard moved to draft mode'
    );
  };

  return (
    <TooltipProvider>
      <Card className="overflow-hidden border border-border/40">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboards.map((dashboard, index) => (
                <motion.tr
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group ${dashboard.status === 'draft' ? 'bg-yellow-50/10' : ''}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted/60 overflow-hidden flex-shrink-0">
                        {dashboard.thumbnail_url ? (
                          <img
                            src={dashboard.thumbnail_url}
                            alt={dashboard.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{dashboard.name}</div>
                        {dashboard.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {dashboard.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dashboard.status === 'draft' ? (
                      <Badge variant="outline" className="bg-yellow-100/50 text-yellow-800 border-yellow-200">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100/50 text-green-800 border-green-200">
                        Published
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {dashboard.visibility === 'public' ? (
                      <Badge variant="outline" className="bg-primary/10">
                        <Eye className="h-3 w-3 mr-1" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-secondary/10">
                        <EyeOff className="h-3 w-3 mr-1" /> Private
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">
                        {dashboard.groups && dashboard.groups.length > 0
                          ? `${dashboard.groups.length} ${dashboard.groups.length === 1 ? 'group' : 'groups'}`
                          : 'No groups'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(dashboard.created_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DropdownMenu>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Actions</TooltipContent>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/${dashboard.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTogglePublish(dashboard)}>
                            {dashboard.status === 'published' ? (
                              <>
                                <ListFilter className="mr-2 h-4 w-4" /> Unpublish
                              </>
                            ) : (
                              <>
                                <FileCheck className="mr-2 h-4 w-4" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(dashboard)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Dashboard</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(dashboard.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Dashboard</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

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
    </TooltipProvider>
  );
}
