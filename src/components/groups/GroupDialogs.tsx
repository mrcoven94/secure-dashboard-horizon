import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  newGroupDesc: string;
  setNewGroupDesc: (desc: string) => void;
  initialMembers: string[];
  setInitialMembers: (members: string[]) => void;
  onCreateGroup: () => void;
}

export const CreateGroupDialog = ({
  open,
  onOpenChange,
  newGroupName,
  setNewGroupName,
  newGroupDesc,
  setNewGroupDesc,
  initialMembers,
  setInitialMembers,
  onCreateGroup
}: CreateGroupDialogProps) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const addMember = () => {
    if (newMemberEmail.trim() && !initialMembers.includes(newMemberEmail.trim())) {
      setInitialMembers([...initialMembers, newMemberEmail.trim()]);
      setNewMemberEmail('');
    }
  };

  const removeMember = (email: string) => {
    setInitialMembers(initialMembers.filter(m => m !== email));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new group to organize users and manage access
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input 
              id="name" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Enter group description"
            />
          </div>
          <div className="space-y-2">
            <Label>Add Members (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter email address"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMember();
                  }
                }}
              />
              <Button type="button" onClick={addMember} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {initialMembers.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label>Initial members:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {initialMembers.map((email, index) => (
                    <div key={index} className="flex items-center justify-between py-1 px-3 bg-muted rounded-md">
                      <span className="text-sm truncate">{email}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => removeMember(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreateGroup}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGroupName: string;
  setEditGroupName: (name: string) => void;
  editGroupDesc: string;
  setEditGroupDesc: (desc: string) => void;
  onEditGroup: () => void;
}

export const EditGroupDialog = ({
  open,
  onOpenChange,
  editGroupName,
  setEditGroupName,
  editGroupDesc,
  setEditGroupDesc,
  onEditGroup
}: EditGroupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update group details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Group Name</Label>
            <Input 
              id="edit-name" 
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Input 
              id="edit-description" 
              value={editGroupDesc}
              onChange={(e) => setEditGroupDesc(e.target.value)}
              placeholder="Enter group description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onEditGroup}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  selectedGroupName?: string;
  onAddMember: () => void;
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  inviteEmail,
  setInviteEmail,
  selectedGroupName,
  onAddMember
}: AddMemberDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to Group</DialogTitle>
          <DialogDescription>
            Add a user to {selectedGroupName || 'this group'} by email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input 
              id="email" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter user email"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddMember();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAddMember}>
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
