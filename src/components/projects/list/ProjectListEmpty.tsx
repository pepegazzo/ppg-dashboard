
import { EmptyState } from "../EmptyState";

interface ProjectListEmptyProps {
  setIsCreating: (isCreating: boolean) => void;
  fetchProjects: () => void;
  testCreateProject: () => void;
}

export function ProjectListEmpty({
  setIsCreating,
  fetchProjects,
  testCreateProject,
}: ProjectListEmptyProps) {
  return (
    <EmptyState
      setIsCreating={setIsCreating}
      handleRefreshProjects={fetchProjects}
      testCreateProject={testCreateProject}
    />
  );
}
