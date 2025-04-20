export interface Project {
  id: string;
  name: string;
  status?: 'Onboarding' | 'Active' | 'Completed';
}

export interface ClientActiveProject {
  id: string;
  client_id: string;
  project_id: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active_projects: Project[] | null;
}
