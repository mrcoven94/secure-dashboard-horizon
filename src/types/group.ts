
export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  // Add the updated_at field that was missing
  updated_at?: string;
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
