import { Badge } from "@/components/ui/badge";

interface ProjectStatusCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectStatusCell({ project, readOnly }: ProjectStatusCellProps) {
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {project.status}
    </Badge>
  );
}
