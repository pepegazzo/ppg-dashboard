
// Add portal_password property to the Project type

import { Database } from "@/integrations/supabase/types";

export type Project = {
  id: string;
  name: string;
  client_name: string;
  client_id?: string | null;
  contact_id?: string | null;
  contact_name?: string | null;
  status: 'Onboarding' | 'Active' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  start_date: string | null;
  due_date: string | null;
  slug: string | null;
  created_at: string;
  package_name?: string | null;
  package_id?: string | null;
  package_names?: string[] | null; // New property for multiple package names
  package_ids?: string[] | null; // New property for multiple package IDs
  revenue?: number | null;
  progress?: number;
  portal_password?: string | null;
};

export type PackageType = {
  id: string;
  name: string;
  description: string | null;
};

export type SortDirection = 'asc' | 'desc';

export type SortableProjectField = 'name' | 'client_name' | 'contact_name' | 'status' | 'priority' | 'start_date' | 'due_date' | 'created_at' | 'package_name' | 'revenue' | 'progress';
