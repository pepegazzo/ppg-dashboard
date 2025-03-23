
export type ProjectStatus = "Onboarding" | "Active" | "Completed";
export type ProjectPriority = "Low" | "Medium" | "High";
export type ProjectPackage = 
  | "Web Design"
  | "Web Development" 
  | "Video Production" 
  | "Video Editing" 
  | "Video Post-Production" 
  | "Sound Post-Production" 
  | "Graphic Design" 
  | "Brand Identity" 
  | "Brand Strategy" 
  | "Copywriting";

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: Date;
  description?: string;
}

export interface Stage {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  dueDate: Date;
  packages: ProjectPackage[];
  slug: string;
  password?: string;
  stages: Stage[];
  createdAt: Date;
}
