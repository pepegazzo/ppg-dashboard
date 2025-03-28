
import { Database } from "@/integrations/supabase/types";

export type Project = {
  id: string;
  name: string;
  client_name: string;
  status: 'Onboarding' | 'Active' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  start_date: string | null;
  due_date: string | null;
  slug: string | null;
  created_at: string;
  package_name?: string | null;
  package_id?: string | null;
  revenue?: number | null;
  progress?: number;
};

export type PackageType = {
  id: string;
  name: string;
  description: string | null;
};

export type SortDirection = 'asc' | 'desc';
