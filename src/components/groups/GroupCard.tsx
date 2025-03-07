
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
};

interface GroupCardProps {
  group: Group;
  onView: (group: Group) => void;
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
}

export const GroupCard = ({ group, onView, onEdit, onDelete }: GroupCardProps) => {
  const { user } = useAuth();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{group.name}</CardTitle>
        {group.description && (
          <CardDescription>
            {group.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Created on {new Date(group.created_at).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={() => onView(group)}
        >
          <Users className="mr-2 h-4 w-4" /> View Members
        </Button>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(group)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
