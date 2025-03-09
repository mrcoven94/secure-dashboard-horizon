
export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at?: string;
  member_count?: number;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  email?: string;
};

export type ExistingUser = {
  id: string;
  email: string;
};
