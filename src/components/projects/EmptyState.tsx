
import { Button } from "@/components/ui/button";
import { Info, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  setIsCreating: (value: boolean) => void;
  handleRefreshProjects: () => void;
  testCreateProject: () => void;
}

export function EmptyState({ setIsCreating, handleRefreshProjects, testCreateProject }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-zinc-300 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-zinc-100 p-3 rounded-full">
          <Info className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">No projects found</h3>
        <p className="text-zinc-500 max-w-md">
          You haven't created any projects yet. Get started by creating your first project.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create your first project
          </Button>
          <Button variant="outline" onClick={handleRefreshProjects}>
            Refresh Projects
          </Button>
          <Button variant="secondary" onClick={testCreateProject}>
            Create Test Project
          </Button>
        </div>
      </div>
    </div>
  );
}
