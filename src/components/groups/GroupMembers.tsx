
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, X, Users } from 'lucide-react';
import { motion } from 'framer-motion';

type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  email?: string;
};

interface GroupMembersProps {
  selectedGroup: Group;
  groupMembers: GroupMember[];
  loadingMembers: boolean;
  onClose: () => void;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
}

export const GroupMembers = ({
  selectedGroup,
  groupMembers,
  loadingMembers,
  onClose,
  onAddMember,
  onRemoveMember
}: GroupMembersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{selectedGroup.name} - Members</CardTitle>
            <CardDescription>
              Manage users in this group
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
            <Button 
              onClick={onAddMember}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : groupMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No members in this group</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Add members to this group to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between py-2 px-4 rounded-md hover:bg-muted"
                >
                  <div>
                    <div className="font-medium">{member.email || 'Unknown Email'}</div>
                    <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
