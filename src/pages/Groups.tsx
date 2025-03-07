
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folders, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GroupCard } from '@/components/groups/GroupCard';
import { GroupMembers } from '@/components/groups/GroupMembers';
import { CreateGroupDialog, EditGroupDialog, AddMemberDialog } from '@/components/groups/GroupDialogs';
import { useGroups } from '@/hooks/useGroups';

export default function Groups() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const {
    groups,
    loading,
    selectedGroup,
    setSelectedGroup,
    groupMembers,
    loadingMembers,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    inviteDialogOpen,
    setInviteDialogOpen,
    newGroupName,
    setNewGroupName,
    newGroupDesc,
    setNewGroupDesc,
    initialMembers,
    setInitialMembers,
    editGroupName,
    setEditGroupName,
    editGroupDesc,
    setEditGroupDesc,
    inviteEmail,
    setInviteEmail,
    handleCreateGroup,
    handleOpenEditDialog,
    handleEditGroup,
    handleDeleteGroup,
    handleOpenGroup,
    handleAddMember,
    handleRemoveMember,
    // New properties for user selection
    existingUsers,
    loadingUsers,
    selectedUsers,
    handleSelectUser,
    handleRemoveSelectedUser
  } = useGroups();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
            <p className="text-muted-foreground">
              Organize users into functional groups for better collaboration
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Group
            </Button>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="my">My Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : groups.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Folders className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No groups found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {user?.role === 'admin' 
                          ? 'Create your first group to get started'
                          : 'You have not been added to any groups yet'}
                      </p>
                      {user?.role === 'admin' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Create Group
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map(group => (
                    <GroupCard 
                      key={group.id}
                      group={group}
                      onView={handleOpenGroup}
                      onEdit={handleOpenEditDialog}
                      onDelete={handleDeleteGroup}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : groups.filter(g => g.created_by === user?.id).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Folders className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No groups created</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You haven't created any groups yet
                      </p>
                      {user?.role === 'admin' && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setCreateDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Create Group
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {groups
                    .filter(g => g.created_by === user?.id)
                    .map(group => (
                      <GroupCard 
                        key={group.id}
                        group={group}
                        onView={handleOpenGroup}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDeleteGroup}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Group Members View */}
        {selectedGroup && (
          <GroupMembers
            selectedGroup={selectedGroup}
            groupMembers={groupMembers}
            loadingMembers={loadingMembers}
            onClose={() => setSelectedGroup(null)}
            onAddMember={() => setInviteDialogOpen(true)}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupDesc={newGroupDesc}
        setNewGroupDesc={setNewGroupDesc}
        initialMembers={initialMembers}
        setInitialMembers={setInitialMembers}
        onCreateGroup={handleCreateGroup}
        // New props for user selection
        existingUsers={existingUsers}
        loadingUsers={loadingUsers}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onRemoveSelectedUser={handleRemoveSelectedUser}
      />

      {/* Edit Group Dialog */}
      <EditGroupDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editGroupName={editGroupName}
        setEditGroupName={setEditGroupName}
        editGroupDesc={editGroupDesc}
        setEditGroupDesc={setEditGroupDesc}
        onEditGroup={handleEditGroup}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        selectedGroupName={selectedGroup?.name}
        onAddMember={handleAddMember}
      />
    </DashboardLayout>
  );
}
