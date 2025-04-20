
export interface Project {
  id: string;
  name: string;
  status?: 'Onboarding' | 'Active' | 'Completed';
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
