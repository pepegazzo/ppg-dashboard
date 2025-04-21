
import { ProjectListContainer } from "./ProjectListContainer";
import { Project, PackageType } from "../types";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  packageTypes: PackageType[];
  fetchProjects: () => void;
  testCreateProject: () => void;
  setIsCreating: (isCreating: boolean) => void;
}

export function ProjectList(props: ProjectListProps) {
  return <ProjectListContainer {...props} />;
}
