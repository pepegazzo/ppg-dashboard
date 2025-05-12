import { Badge } from "@/components/ui/badge";

interface ProjectStatusCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectStatusCell({ project, readOnly }: ProjectStatusCellProps) {
  return (
    <Badge variant="secondary" className="px-2.5 py-1 rounded-full w-fit border border-zinc-300 bg-zinc-100 text-zinc-800 inline-flex items-center gap-1 text-xs font-medium">
      {project.status}
    </Badge>
  );
}
