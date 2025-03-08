
export type Dashboard = {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  tableau_url?: string | null;
  embed_code?: string | null;
  visibility: string;
  status: 'draft' | 'published';
  groups?: string[];
  created_at: string;
  created_by: string;
  updated_at?: string;
  group_count: number;
  thumbnail_url?: string | null;
};

export type DashboardGroup = {
  id: string;
  dashboard_id: string;
  group_id: string;
  created_at: string;
};
