
export interface Contact {
  id: string;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
  company_id: string;
}

export interface Project {
  id: string;
  name: string;
  status?: 'Onboarding' | 'Active' | 'Completed' | 'Cancelled';
}

export interface ClientProjectAssignment {
  id: string;
  client_id: string;
  project_id: string;
  created_at: string;
}

// Now: "Client" is a company/brand (not a person).
export interface Client {
  id: string;
  company_name: string;
  company: string; // Original field mapped from old structure (can be organization legal name, etc)
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  contacts: Contact[] | null; // new: list of associated contacts (people)
  active_projects: Project[] | null;
}
