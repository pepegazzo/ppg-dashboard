import { Button } from "@/components/ui/button";

interface ProjectListErrorProps {
  error: string;
  fetchProjects: () => void;
}

export function ProjectListError({ error, fetchProjects }: ProjectListErrorProps) {
  return (
    <div className="border border-zinc-200 bg-zinc-50 rounded-lg p-6 text-center">
      <h3 className="text-lg font-medium text-zinc-800 mb-2">Error loading projects</h3>
      <p className="text-zinc-600 mb-4">{error}</p>
      <Button variant="outline" onClick={fetchProjects}>
        Try Again
      </Button>
    </div>
  );
}
